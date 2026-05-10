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
