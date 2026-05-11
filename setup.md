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

### Option A: Create a New Cluster
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

### Option B: Add to an Existing Cluster
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

## 3. Build and Push Docker Images
Authenticate Docker with Amazon Elastic Container Registry (ECR):

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
```

Build the images for the `api`, `worker`, and `llm` services:

```bash
docker build -t neris-api ./api
docker build -t neris-worker ./worker
docker build -t neris-llm ./llm
```

Tag and push the images to your ECR repositories:

```bash
docker tag neris-api:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-api:latest
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/neris-api:latest
# Repeat for worker and llm
```

## 4. Install Dependencies via Helm
Deploy standard infrastructure components like Redis (required for async queue mode). Alternatively, use AWS ElastiCache for production:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis --set architecture=standalone
```

## 5. Deploy Kubernetes Manifests
Apply the application manifests from the `k8s/` directory. Be sure to update the image paths in the YAML files to point to your ECR repositories.

```bash
kubectl apply -f k8s/
```

Verify that all pods are running:

```bash
kubectl get pods
```

---

## Infrastructure Costs

The current setup utilizes compute-optimized instances to handle CPU-based inference effectively. 

**Biggest Cost Drivers in Your Setup**
Estimated monthly baseline if left running (even when idle):

| Service | Approx Monthly |
|---------|----------------|
| **EKS control plane** | ~$72 |
| **2x c7i.2xlarge** | ~$240–320 |
| **ElastiCache / Redis** | ~$15–40 |
| **NAT/VPC** | ~$5–40 |
| **Total** | **~$330–430/month** |

To avoid unnecessary costs, remember to scale down the node group or delete the cluster when not in use:
```bash
eksctl delete cluster --name neris-narrative-validation --region us-east-1
```

---

## Cost Reduction Strategies

### 1. Downsize the node type (saves ~$130–160/month)

The K8s `llm-deployment.yaml` only *requests* 4 CPU / 8Gi, not 8 CPU / 16Gi. A `c7i.xlarge` (4 vCPU, 8 GiB) is exactly right and costs roughly half as much as a `c7i.2xlarge`.

Change `--node-type c7i.2xlarge` → `--node-type c7i.xlarge` in the `eksctl create` commands above.

New estimate: **2x c7i.xlarge ≈ $120–160/month**

### 2. Use Spot instances (saves ~60–70% on EC2)

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

### 3. Self-host Redis inside the cluster (saves ~$15–40/month)

The Helm chart already installs Redis as a pod. Skip ElastiCache entirely for non-production use — the in-cluster Redis is sufficient:

```bash
helm install redis bitnami/redis \
  --set architecture=standalone \
  --set auth.enabled=false
```

Remove any ElastiCache terraform/CDK resources. This alone eliminates the $15–40 line item.

### 4. Replace EFS with EBS for model storage (saves ~$5–15/month)

The `llm-pvc.yaml` uses `storageClassName: efs-sc` (ReadOnlyMany). A single-replica LLM pod only needs `ReadWriteOnce`, so EBS (`gp3`) is cheaper and lower-latency:

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

### 5. Scale to zero when the queue is empty (eliminates idle EC2 cost)

Install [KEDA](https://keda.sh/) and add a `ScaledObject` that watches the `validation` Redis list. When the queue depth is 0, KEDA scales the worker and LLM deployments to 0 replicas — the node group autoscaler then terminates the nodes, leaving only the $72 EKS control plane running.

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm install keda kedacore/keda --namespace keda --create-namespace
```

### Revised cost estimate

| Strategy applied | Approx Monthly |
|-----------------|----------------|
| Downsize to c7i.xlarge + Spot | ~$36–50 |
| Self-hosted Redis (no ElastiCache) | $0 |
| EBS instead of EFS | ~$1–2 |
| EKS control plane | ~$72 |
| NAT/VPC | ~$5–15 |
| **Total (always-on)** | **~$115–140/month** |
| **Total (KEDA scale-to-zero, light usage)** | **~$75–85/month** |
