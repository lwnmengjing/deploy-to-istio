## matrix-cd-template
### 模版参数(环境变量)
environment|request|default|label
---|:---:|:---:|:---
DEPLOY_NAMESPACE|no|default|deploy namespace
APP_NAME|yes||application name
MICRO_APP_NAME|yes||micro service name
MICRO_APP_VERSION|no|v1|micro service version
IMAGE_NAME|yes||micro service ci's image name
IMAGE_TAG|no|latest|micro service ci's image tag
PORT_NUMBER|no|8000|micro service expose port
PORT_NAME|no|http|micro service port name(include protocol e.g. auth-http, auth-grpc)

### github actions集成
#### 方式一(推荐)：
```yaml

# This is a basic workflow to help you get started with Actions
#code...
env:
  IMAGE_NAME: 043446723194.dkr.ecr.us-west-2.amazonaws.com/matrix-cloud-account
  IMAGE_TAG: 0e16fbd86741f19010b652f763330d6207bcfd66
  DEPLOY_NAMESPACE: default
  APP_NAME: matrixworld
  MICRO_APP_NAME: account
  MICRO_APP_VERSION: v1
  AWS_REGION: ap-northeast-1
  EKS_CLUSTER_NAME: metaverse-beta
#code...
# A workflow run is made up of one or more jobs that can run sequentially or in parallel
      - name: Deploy
        uses: cancue/eks-action@v0.0.2
        env:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: $AWS_REGION
          cluster_name: $EKS_CLUSTER_NAME
        with:
          args: |
            kubectl set image deployment $MICRO_APP_NAME-$MICRO_APP_VERSION -n $DEPLOY_NAMESPACE $MICRO_APP_NAME=$IMAGE_NAME:$IMAGE_TAG
            kubectl rollout status deployment/$MICRO_APP_NAME-$MICRO_APP_VERSION -n $DEPLOY_NAMESPACE
```
#### 方式2:
> 在项目secret中配置MATRIX_CD_SSH_KEY自己的ssh私钥(e.g. cat ~/.ssh/id_rsa)
```yaml
#code...
env:
  IMAGE_NAME: 043446723194.dkr.ecr.us-west-2.amazonaws.com/matrix-cloud-account
  IMAGE_TAG: 0e16fbd86741f19010b652f763330d6207bcfd66
  DEPLOY_NAMESPACE: default
  APP_NAME: matrixworld
  MICRO_APP_NAME: account
  MICRO_APP_VERSION: v1
  AWS_REGION: ap-northeast-1
  EKS_CLUSTER_NAME: metaverse-beta

#code...

      - name: Checkout cd-template
        uses: actions/checkout@v2
        with:
          repository: WhiteMatrixTech/matrix-cd-template
          path: cdk8s
          ssh-key: ${{ secrets.MATRIX_CD_SSH_KEY }}
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: cd cdk8s && npm install && npm run build && cat dist/account.k8s.yaml
      - name: Deploy
        uses: cancue/eks-action@v0.0.2
        env:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: $AWS_REGION
          cluster_name: $EKS_CLUSTER_NAME
        with:
          args: |
            kubectl apply -f cdk8s/dist/services
```