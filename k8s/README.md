# Kubernetes Deployment

This directory contains all Kubernetes manifests required for deployment.

## Directory Structure

```text
k8s/
├── namespace.yaml
├── api-deployment.yaml
├── api-service.yaml
├── worker-deployment.yaml
├── llm-deployment.yaml
├── llm-service.yaml
├── ingress.yaml
├── hpa.yaml
└── secrets.yaml
```

## Deployment Order

Recommended deployment order:
1. namespace
2. secrets
3. llm deployment/service
4. worker deployment
5. api deployment/service
6. ingress
7. autoscaling

## Apply Manifests

```bash
kubectl apply -f k8s/
```

## Verify Pods

```bash
kubectl get pods -n neris-ai
```

## Verify Services

```bash
kubectl get svc -n neris-ai
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
| Workers   | Queue depth      |
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