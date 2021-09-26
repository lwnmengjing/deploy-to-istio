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

### github actions集成
> 在项目secret中配置MATRIX_CD_SSH_KEY自己的ssh公钥(e.g. cat ~/.ssh/id_rsa)
```yaml
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
        env: 
          DEPLOY_NAMESPACE: default
          APP_NAME: matrixworld
          MICRO_APP_NAME: account
          MICRO_APP_VERSION: v1
          IMAGE_NAME: 043446723194.dkr.ecr.us-west-2.amazonaws.com/matrix-cloud-account
          IMAGE_TAG: latest
```