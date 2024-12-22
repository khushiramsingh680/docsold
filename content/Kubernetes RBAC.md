---
title: "Kubernetes RBAC"
weight: 21
no_list: true
---

## RBAC
Kubernetes RBAC is a powerful security feature that allows administrators to control who can access the Kubernetes API and what actions they can perform. 
You can use it to implement the principle of "least privilege," which means that users should have the minimum levels of access necessary to perform their tasks. This approach minimizes the potential for accidental or malicious misuse of the Kubernetes system.<br>

Role-based access control (RBAC) is a method of regulating access to computer or network resources based on the roles of individual users within your organization.
#### Core Components of Kubernetes RBAC 
#### Role
- Roles define a set of permissions within a specific namespace.
- They define which actions (verbs) can be performed on which resources (nouns) within that namespace. A role, for example, might enable a user to list and retrieve pods in a specific namespace.
ClusterRole, by contrast, is a non-namespaced resource. The resources have different names (Role and ClusterRole) because a Kubernetes object always has to be either namespaced or not namespaced; it can't be both.

#### ClusterRoles 
- It has several uses. You can use a ClusterRole to define permissions on namespaced resources and be granted access within individual namespace(s)
- define permissions on namespaced resources and be granted access across all namespaces
- define permissions on cluster-scoped resources
#### RoleBinding and ClusterRoleBinding
- A role binding grants the permissions defined in a role to a user or set of users. It holds a list of subjects (users, groups, or service accounts).
-  A RoleBinding grants permissions within a specific namespace whereas a ClusterRoleBinding grants that access cluster-wide.


### [Documentation and Websites Referred](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)

#### Service Account
- A service account provides an identity for processes that run in a Pod, and maps to a ServiceAccount object.
- Token associated to a SA is stored at `/var/run/secrets/kubernetes.io/`serviceaccount/token inside a pod
- We can configure a SA not to mount a secret in pod using 
```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: build-robot
automountServiceAccountToken: false
EOF
```

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: build-robot
  automountServiceAccountToken: false
EOF 
```
#### Step 1: Create a new Service Account:
```sh
kubectl create serviceaccount external
```

#### Step 2: Create a new POD with External Service Account
```sh
kubectl run external-pod --image=nginx --dry-run=client -o yaml
```
Add following contents under .spec
```sh
serviceAccountName: external
```
Final File will look like this:

```sh
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: external-pod
  name: external-pod
spec:
  serviceAccountName: external
  containers:
  - image: nginx
    name: external-pod
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
EOF
```
```sh
kubectl apply -f pod-sa.yaml
```
#### Step 3: Verification
```sh
kubectl get pods
kubectl get pod external -o yaml
```
#### Step 4: Fetch the Token of a POD

```sh
kubectl exec -it external-pod -- bash
cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

#### Step 5: Make a Request to Kubernetes using Token
```sh
curl -k <K8S-SERVER-URL>
curl -k <K8S-SERVER-URL>/api/v1 --header "Authorization: Bearer <TOKEN-HERE>"
```

### Create user with certificate 
#### Step 1: Create a new private key  and CSR

```sh
mkdir /root/certificates
cd /root/certificates
```
```sh
openssl genrsa -out john.key 2048
openssl req -new -key john.key -out john.csr -subj "/CN=john/O=finance"
```
#### Step 2: Decode the csr
```sh
cat john.csr | base64 | tr -d '\n'
```

#### Step 3: Generate the Kubernetes Signing Request
```sh
nano csr-requests.yaml
```
```sh
kubectl apply -f - <<EOF
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: john-csr
spec:
  groups:
  - system:authenticated
  request: ADD-YOUR-CSR-HERE
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - digital signature
  - key encipherment
  - client auth
EOF
```
#### Step 4: Apply the Signing Requests:
```sh
kubectl apply -f csr-requests.yaml
```
You can optionally verify with  kubectl get csr

#### Step 5: Approve the csr
```sh
kubectl certificate approve john-csr
```
#### Step 6: Download the Certificate from csr
```sh
kubectl get csr john-csr -o jsonpath='{.status.certificate}' | base64 -d > john.crt
```
#### Step 7: Create a new context
```sh
kubectl config set-credentials john --client-certificate=john.crt --client-key=john.key
```
#### Step 8: Set new Context
```sh
kubectl config set-context john-context --cluster [YOUR-CLUSTER-HERE] --user=john
```
#### Step 9: Use Context to Verify
```sh
kubectl --context=john-context get pods
```
#### Step 10: Create RBAC Role Allowing List PODS Operation


```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["list"]
EOF
```


#### Step 11: Create a New Role Binding

```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: john
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF
```
#### Step 12: Verify Permissions

```sh
kubectl --context=john-context get pods
```

#### Step 13: Delete Resources Created in this Lab


#### NameSpace Access Control

```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: teama
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list", "create"]
EOF
```

### teama-rolebinding.yaml
```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: teama
subjects:
- kind: User
  name: john
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF
```

### [ClusterRole & ClusterRoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/authorization/)

##### Step 1: Delete Role and Role Binding

##### Step 2: Create a Cluster Role

```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["list"]
EOF
```
- Check clusterrole
```sh
kubectl get clusterrole
kubectl describe clusterrole pod-reader
```

#### Step 3: Create a Cluster Role Binding for a ServiceAccount named external in default namespace (make sure to create sa in right namespace)

```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: list-pods-global
subjects:
- kind: User
  name: system:serviceaccount:default:external
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF
```
- Check Clusterrolebindings
```sh
kubectl get clusterrolebinding
kubectl describe clusterrolebinding list-pods-global
```
##### Step 4: Verify Permissions
```sh
curl -k <K8S-SERVER-URL>/api/v1/namespaces/default/pods --header "Authorization: Bearer <TOKEN-HERE>"
```
##### Step 5: Create a new Namespace
```sh
kubectl create namespace external
```
```sh
curl -k <K8S-SERVER-URL>/api/v1/namespaces/external/pods --header "Authorization: Bearer <TOKEN-HERE>"
```

#### Step 6: Delete Cluster Role Binding

- Verify if you receive forbidden error.
```sh
curl -k <K8S-SERVER-URL>/api/v1/namespaces/external/pods --header "Authorization: Bearer <TOKEN-HERE>"
```

#### Step 7: Create Role Binding with ClusterRole

```sh
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: system:serviceaccount:default:external
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF
```

#### Step 8: Verification
```sh
curl -k <K8S-SERVER-URL>/api/v1/namespaces/external/pods --header "Authorization: Bearer <TOKEN-HERE>"
```
```sh
curl -k <K8S-SERVER-URL>/api/v1/namespaces/default/pods --header "Authorization: Bearer <TOKEN-HERE>"
```
- You can also assign cluster-Admin role using below
```bash
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
EOF
```


### Role with Imperative commands
### Create a Role named "pod-reader" that allows users to perform get, watch and list on pods:
```bash

kubectl create role pod-reader --verb=get --verb=list --verb=watch --resource=pods
```
### Create a Role named "pod-reader" with resourceNames specified:
```bash
kubectl create role pod-reader --verb=get --resource=pods --resource-name=readablepod --resource-name=anotherpod
```
### Create a Role named "foo" with apiGroups specified:
```t
kubectl create role foo --verb=get,list,watch --resource=replicasets.apps
```
### Create a Role named "foo" with subresource permissions:
```bash
kubectl create role foo --verb=get,list,watch --resource=pods,pods/status

```
### Create a Role named "my-component-lease-holder" with permissions to get/update a resource with a specific name:
```bash
kubectl create role my-component-lease-holder --verb=get,list,watch,update --resource=lease --resource-name=my-component
```

## CLusterROle
### Create a ClusterRole named "pod-reader" that allows user to perform get, watch and list on pods:
```bash
kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods
```
### Create a ClusterRole named "pod-reader" with resourceNames specified:
```bash
kubectl create clusterrole pod-reader --verb=get --resource=pods --resource-name=readablepod --resource-name=anotherpod
```

### Create a ClusterRole named "foo" with apiGroups specified:
```bash
kubectl create clusterrole foo --verb=get,list,watch --resource=replicasets.apps
```

### Create a ClusterRole named "foo" with subresource permissions:
```bash
kubectl create clusterrole foo --verb=get,list,watch --resource=pods,pods/status
```



### Rolebindings with Imperative commands

```bash
kubectl create clusterrolebinding myapp-view-binding --clusterrole=view --serviceaccount=acme:myapp
```

```bash
kubectl create rolebinding my-sa-view \
  --clusterrole=view \
  --serviceaccount=my-namespace:my-sa \
  --namespace=my-namespace
```
# Kubernetes RBAC Setup

- Authentication 
- Authorization


### Role Binding
The rolebinding.yaml file defines a role binding named read-pods that binds the pod-reader role to the user jack in the default namespace.
## Cluster Role
The clusterrole.yaml file contains the configuration for creating a cluster role named secret-reader. This cluster role allows the user to perform actions like get, watch, and list on secrets resources.
### Role Binding (Namespace-level)
The rolebinding.yaml file defines a role binding named read-secrets that binds the secret-reader cluster role to the user dev in the development namespace.
## Cluster Role Binding
The clusterrolebinding.yaml file contains the configuration for creating a cluster role binding named read-secrets-global. This cluster role binding binds the secret-reader cluster role to the user riya globally.






## [SecurityContext](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
 - A Kubernetes security context is a set of security settings that are applied at the pod or container level. 
 - It provides you with the ability to define privilege and access controls for pods or containers. 
 - Example 1
```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: pod-context
spec:
  securityContext:
      runAsUser: 1000
      runAsGroup: 3000
  containers:
  - name: sec-ctx-demo
    image: busybox
    command: [ "sh", "-c", "sleep 1h" ]
EOF
```
- Check the user id assigned
```sh
kubectl exec -it pod-context sh
id
```

-  Example 2
```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: security-context-demo
spec:
  securityContext:
    fsGroup: 2000
  volumes:
  - name: sec-ctx-vol
    emptyDir: {}
  containers:
  - name: sec-ctx-demo
    image: busybox
    command: [ "sh", "-c", "sleep 1h" ]
    volumeMounts:
    - name: sec-ctx-vol
      mountPath: /data/demo
EOF
```
- Check the permission of /data/demo
```sh
 kubectl exec -it security-context-demo sh
 cd /data
 ls -l 
 ```

