# Kubernetes Deployment

This directory contains all Kubernetes manifests required for deployment. Deployments are available for both CPU-based and GPU-accelerated inference.

## Directory Structure

```text
k8s/
├── namespace.yaml
├── api-deployment.yaml
├── api-service.yaml
├── llm-pvc.yaml
├── llm-deployment.yaml          (CPU-based LLM inference)
├── llm-deployment-gpu.yaml       (GPU-accelerated LLM inference)
├── llm-service.yaml
├── ingress.yaml
├── hpa.yaml
└── secrets.yaml
```

## Deployment Options

### CPU-based Deployment (Default)

For CPU-optimized instances (c7i.xlarge, c7i.2xlarge, etc.):

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/llm-pvc.yaml
kubectl apply -f k8s/llm-deployment.yaml    # CPU-based
kubectl apply -f k8s/llm-service.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

Or apply all at once:
```bash
kubectl apply -f k8s/
```

### GPU-accelerated Deployment

For GPU instances (g4dn.xlarge, g4dn.2xlarge, etc.) with NVIDIA T4 GPUs:

```bash
# Prerequisites: Ensure NVIDIA device plugin is installed
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/master/nvidia-device-plugin.yml

# Deploy with GPU support
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/llm-pvc.yaml
kubectl apply -f k8s/llm-deployment-gpu.yaml  # GPU-accelerated
kubectl apply -f k8s/llm-service.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

To deploy GPU LLM with all other CPU services:
```bash
kubectl apply -f k8s/
kubectl apply -f k8s/llm-deployment-gpu.yaml
```

## Deployment Order

Recommended deployment order:
1. namespace
2. secrets
3. llm pvc
4. llm deployment/service (CPU or GPU)
5. api deployment/service
6. ingress
7. autoscaling

## Verify Pods

```bash
kubectl get pods -n neris-ai
```

## Verify Services

```bash
kubectl get svc -n neris-ai
```

## GPU Troubleshooting

Check for GPU availability:
```bash
kubectl get nodes -L nvidia.com/gpu
```

Verify NVIDIA device plugin status:
```bash
kubectl get daemonset -A -l app=nvidia-device-plugin
```

Check GPU pod allocation:
```bash
kubectl describe pod <llm-deployment-gpu-pod-name> -n neris-ai
```

View GPU device logs:
```bash
kubectl logs -n kube-system -l app=nvidia-device-plugin
```

## Internal Services

| Service                | Type      |
| ---------------------- | --------- |
| validation-api-service | ClusterIP |
| llm-service            | ClusterIP |

## Ingress

The ingress exposes the FastAPI service publicly through AWS ALB.

llama.cpp should NEVER be exposed publicly.

## Autoscaling

Recommended autoscaling:

| Component | Strategy         |
| --------- | ---------------- |
| API       | CPU utilization  |
| LLM       | Manual initially |

## Secrets

Recommended secrets:
- Redis endpoint
- API keys
- internal credentials

## Security Recommendations

- use private VPC networking
- use internal ClusterIP services
- restrict Redis access
- enable encryption
- avoid public LLM endpoints

## Monitoring Recommendations

Recommended stack:

| Purpose    | Tool       |
| ---------- | ---------- |
| Metrics    | Prometheus |
| Dashboards | Grafana    |
| Logs       | CloudWatch |

Track:
- queue depth
- inference latency
- malformed JSON rate
- pod restarts
- token throughput