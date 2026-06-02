# AWS EKS Setup Guide

This guide provides instructions to set up the NERIS Narrative Validation system on AWS using `awscli`, `eksctl`, `kubectl`, `docker`, and `helm`.

## Prerequisites
Ensure the following tools are installed on your local machine:
- [AWS CLI](https://aws.amazon.com/cli/)
- [Docker](https://docs.docker.com/get-docker/)
- [eksctl](https://eksctl.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)

## 1. Configure AWS CLI
Authenticate with your AWS account:
```bash
aws configure
```
Provide your Access Key ID, Secret Access Key, default region (e.g., `us-east-1`), and output format (`json`).

## 2. Provision Cluster & Node Groups

### Option A: Create a New Cluster (CPU-based)
Use `eksctl` to provision a completely new cluster with the necessary compute-optimized instances for CPU-bound LLM inference:

```bash
eksctl create cluster \
  --name neris-narrative-validation \
  --region us-east-1 \
  --nodegroup-name cpu-workers \
  --node-type c7i.2xlarge \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```
*Note: This process may take 15-20 minutes.*

### Option A-GPU: Create a New Cluster (GPU-based)
For faster inference with GPU acceleration, use `g4dn` instances (NVIDIA T4 GPUs):

```bash
eksctl create cluster \
  --name neris-narrative-validation \
  --region us-east-1 \
  --nodegroup-name gpu-workers \
  --node-type g4dn.xlarge \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed
```

After cluster creation, install the NVIDIA device plugin for GPU support:
```bash
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/master/nvidia-device-plugin.yml
```

*Note: GPU cluster setup may take 20-25 minutes. Ensure you have GPU quota in your AWS account.*

### Option B: Add to an Existing Cluster (CPU node group)
If you already have an EKS cluster running, you only need to add the `cpu-workers` node group and update your local context.

1. Create the new compute node group:
```bash
eksctl create nodegroup \
  --cluster <your-existing-cluster-name> \
  --region us-east-1 \
  --name cpu-workers \
  --node-type c7i.2xlarge \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

2. Update your local `kubeconfig` to connect to the existing cluster:
```bash
aws eks update-kubeconfig --region us-east-1 --name <your-existing-cluster-name>
```

### Option B-GPU: Add GPU Node Group to Existing Cluster
To add GPU capability to an existing cluster:

```bash
eksctl create nodegroup \
  --cluster <your-existing-cluster-name> \
  --region us-east-1 \
  --name gpu-workers \
  --node-type g4dn.xlarge \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

# Install NVIDIA device plugin
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/master/nvidia-device-plugin.yml
```

### Enable EBS Storage Driver Addon
To support persistent volumes (PVCs) for model storage on AWS EBS:

```bash
eksctl utils associate-iam-oidc-provider --cluster neris-narrative-validation --region us-east-1 --approve
eksctl create addon --name aws-ebs-csi-driver --cluster neris-narrative-validation --region us-east-1
```

## 3. Build and Push Docker Images
Authenticate Docker with Amazon Elastic Container Registry (ECR):

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
```

Build the images for the `api` and `llm` services:

```bash
docker build -t neris-api ./api
docker build -t neris-llm ./llm
```

Tag and push the images to your ECR repositories:

```bash
docker tag neris-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-api:latest
docker tag neris-llm:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-llm:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-llm:latest
```

## 4. Deploy Kubernetes Manifests & Seed LLM Model

### Apply Manifests
Apply the CPU-based manifests from the `k8s/` directory. Be sure to update the image paths in the YAML files to point to your ECR repositories.

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

### Seed the LLM Model File (to Persistent Volume)
Since the EBS persistent volume starts empty, you need to copy the GGUF model file into the pod's persistent storage. 

To do this, patch the deployment to keep the container running under `sleep` (without liveness/readiness probe failures), make the volume mount writeable, copy the model, and then restore the deployment:

```bash
# 1. Patch the deployment to run sleep infinity and disable probes
kubectl patch deployment llm-deployment -n neris-ai --patch '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"llama-cpp\",\"command\":[\"sleep\",\"infinity\"],\"livenessProbe\":null,\"readinessProbe\":null}]}}}}'

# 2. Patch volume mount to make it writeable (not read-only)
kubectl patch deployment llm-deployment -n neris-ai --patch '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"llama-cpp\",\"volumeMounts\":[{\"name\":\"model-storage\",\"mountPath\":\"/app/models\",\"readOnly\":false}]}]}}}}'

# 3. Get the pod name (PowerShell syntax)
$POD_NAME = (kubectl get pods -n neris-ai -l app=llm -o jsonpath='{.items[0].metadata.name}')

# 4. Copy the model file to the container's volume mount
kubectl cp llm/models/llama-neris.Q4_K_M.gguf neris-ai/$POD_NAME:/app/models/

# 5. Remove the command override so the container starts the normal server
kubectl patch deployment llm-deployment -n neris-ai --type json -p='[{"op": "remove", "path": "/spec/template/spec/containers/0/command"}]'
```

### GPU Deployment (Optional)
For GPU-accelerated deployment, use the GPU-specific manifest:

```bash
kubectl apply -f k8s/llm-deployment-gpu.yaml
```

Verify that all pods are running:

```bash
kubectl get pods -n neris-ai
kubectl get svc -n neris-ai
kubectl get nodes -L nvidia.com/gpu
```

## 5. Configure HTTPS/SSL & Timeouts on the Load Balancer

To secure your public API and handle long-running model validation requests, configure SSL certificates, timeouts, and health checks on your Classic Load Balancer.

### 1. Request SSL Certificate (ACM)
```bash
aws acm request-certificate --domain-name your-api.example.com --validation-method DNS
```

### 2. Configure HTTPS Listener
Create a listener on the Classic Load Balancer that accepts HTTPS traffic on port 443 and forwards it to your application on port 8000:
```bash
aws elb create-load-balancer-listeners --load-balancer-name <your-load-balancer-name> --listeners "Protocol=HTTPS,LoadBalancerPort=443,InstanceProtocol=HTTP,InstancePort=8000,SSLCertificateId=arn:aws:acm:region:account:certificate/your-certificate-id"
```

### 3. Increase Idle Timeout
Since LLM validation can take up to 2-3 minutes, increase the load balancer's idle timeout from the default 60 seconds to 300 seconds (5 minutes):
```bash
aws elb modify-load-balancer-attributes --load-balancer-name <your-load-balancer-name> --load-balancer-attributes ConnectionSettings={IdleTimeout=300}
```

### 4. Configure TCP Health Check
Update the load balancer health check target to check port 8000 over TCP (which avoids GET/POST method validation errors on the `/health` endpoint):
```bash
aws elb configure-health-check --load-balancer-name <your-load-balancer-name> --health-check Target=TCP:8000,Interval=10,Timeout=2,UnhealthyThreshold=2,HealthyThreshold=2
```

---

## Infrastructure Costs

The setup supports both CPU-based and GPU-based inference. Choose based on your performance and budget requirements.

### CPU-based Setup
Utilizes compute-optimized instances for CPU-bound LLM inference.

**Estimated monthly baseline if left running (even when idle):**

| Service | Approx Monthly |
|---------|----------------|
| **EKS control plane** | ~$72 |
| **2x c7i.2xlarge** | ~$240–320 |
| **NAT/VPC** | ~$5–40 |
| **Total** | **~$317–432/month** |

### GPU-based Setup (g4dn.xlarge with NVIDIA T4)
GPU acceleration provides 3-5x faster inference but at higher cost.

**Estimated monthly baseline if left running (even when idle):**

| Service | Approx Monthly |
|---------|----------------|
| **EKS control plane** | ~$72 |
| **2x g4dn.xlarge (with T4 GPU)** | ~$700–840 |
| **NAT/VPC** | ~$5–40 |
| **Total** | **~$777–952/month** |

**Cost Comparison:** GPU setup is ~2.5-3x more expensive but delivers significantly faster inference for real-time applications.

To avoid unnecessary costs, remember to scale down the node group or delete the cluster when not in use:
```bash
eksctl delete cluster --name neris-narrative-validation --region us-east-1
```

---

## Cost Reduction Strategies

### CPU Setup Cost Optimization

#### 1. Downsize the node type (saves ~$130–160/month)

The K8s `llm-deployment.yaml` only *requests* 2 CPU / 6Gi, not 8 CPU / 16Gi. A `c7i.xlarge` (4 vCPU, 8 GiB) is exactly right and costs roughly half as much as a `c7i.2xlarge`.

Change `--node-type c7i.2xlarge` → `--node-type c7i.xlarge` in the `eksctl create` commands above.

New estimate: **2x c7i.xlarge ≈ $120–160/month**

#### 2. Use Spot instances (saves ~60–70% on EC2)

Add `--spot` to the eksctl node group to bid on spare capacity. Spot interruptions are rare for c7i and llama.cpp restarts in seconds.

```bash
eksctl create nodegroup \
  --cluster neris-narrative-validation \
  --name cpu-workers-spot \
  --node-type c7i.xlarge \
  --nodes 2 --nodes-min 1 --nodes-max 4 \
  --managed --spot
```

Combined with the right-sized instance: **≈ $36–50/month for EC2** instead of $240–320.

#### 3. Use GP3 for model storage (saves ~$5–15/month)

The `llm-pvc.yaml` currently uses `gp2`. Upgrading to `gp3` is cheaper and offers better performance:

```yaml
# k8s/llm-pvc.yaml
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 10Gi
```

### GPU Setup Cost Optimization

#### 1. Use GPU Spot instances (saves ~50–60% on GPU costs)

```bash
eksctl create nodegroup \
  --cluster neris-narrative-validation \
  --name gpu-workers-spot \
  --node-type g4dn.xlarge \
  --nodes 1 --nodes-min 1 --nodes-max 3 \
  --managed --spot
```

New estimate: **1–2x g4dn.xlarge (Spot) ≈ $350–420/month** instead of $700–840.

#### 2. Use g4dn.12xlarge for batch processing (cost-effective at scale)

For batch inference workloads, larger instances with multiple GPUs offer better per-GPU cost:

```bash
eksctl create nodegroup \
  --cluster neris-narrative-validation \
  --name gpu-workers-batch \
  --node-type g4dn.12xlarge \
  --nodes 1 --nodes-min 1 --nodes-max 2 \
  --managed
```

Note: Requires updating `llm-deployment-gpu.yaml` to request multiple GPUs.

#### 3. Combine CPU and GPU nodes (hybrid approach)

Keep CPU nodes for non-intensive tasks and scale GPU nodes only when needed:

```bash
# Create CPU node group (always-on, low-cost)
eksctl create nodegroup \
  --cluster neris-narrative-validation \
  --name cpu-workers \
  --node-type c7i.xlarge \
  --nodes 1 --nodes-min 1 --nodes-max 2 \
  --managed

# Create GPU node group (scale up on-demand)
eksctl create nodegroup \
  --cluster neris-narrative-validation \
  --name gpu-workers \
  --node-type g4dn.xlarge \
  --nodes 0 --nodes-min 0 --nodes-max 2 \
  --managed
```

### Revised cost estimates

#### CPU Setup

| Strategy applied | Approx Monthly |
|-----------------|----------------|
| Downsize to c7i.xlarge + Spot | ~$36–50 |
| EBS instead of EFS | ~$1–2 |
| EKS control plane | ~$72 |
| NAT/VPC | ~$5–15 |
| **Total (always-on)** | **~$114–139/month** |

#### GPU Setup

| Strategy applied | Approx Monthly |
|-----------------|----------------|
| 1x g4dn.xlarge (Spot) | ~$175–210 |
| CPU worker node (c7i.xlarge) | ~$60–80 |
| EBS storage | ~$1–2 |
| EKS control plane | ~$72 |
| NAT/VPC | ~$5–15 |
| **Total (always-on hybrid)** | **~$313–379/month** |
