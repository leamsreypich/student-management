# Student Management System (Microservices)

Postman -> API Gateway (NodePort 30080)
  - /register           -> Registration (same pod, localhost:3001)
  - /students, /login   -> Student Service (Pod 2)
  - MySQL runs as a separate deployment.

## Run
    minikube start --driver=docker
    eval $(minikube docker-env)     # PowerShell: minikube docker-env | Invoke-Expression
    docker build -t api-gateway:1.0 ./api-gateway
    docker build -t registration:1.0 ./registration
    docker build -t student-service:1.0 ./student-service
    kubectl apply -f k8s/mysql.yaml
    kubectl apply -f k8s/services.yaml
    kubectl apply -f k8s/app-pod1.yaml
    kubectl apply -f k8s/app-pod2.yaml
    kubectl get pods
    minikube service api-gateway --url

## Endpoints (via gateway)
- POST   /register
- GET    /students/search?id=1 | ?name=abc
- POST   /login
- PUT    /students/:id
- DELETE /students/:id
