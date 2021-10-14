import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { AppService } from './lib/app-service';

export class AppChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const port = process.env.PORT_NUMBER ? Number(process.env.PORT_NUMBER.toString()) : 8000
    const portName = process.env.PORT_NAME ? process.env.PORT_NAME : 'http'
    const version = process.env.MICRO_APP_VERSION ? process.env.MICRO_APP_VERSION : 'v1'

    if (!process.env.IMAGE_NAME) {
      throw new Error('ENV IMAGE_NAME Undefined');
    }

    if (!process.env.APP_NAME) {
      throw new Error('ENV APP_NAME Undefined');
    }

    let image =  process.env.IMAGE_NAME.toString();

    if (process.env.IMAGE_TAG) {
      image = image + ':' + process.env.IMAGE_TAG.toString();
    }

    const commitSha = process.env.COMMIT_SHA && process.env.COMMIT_SHA.toString();


    const app = process.env.APP_NAME.toString();

    new AppService(this, id, { 
      app,
      image,
      ...props,
      replicas: 1, 
      portName,
      port,
      commitSha,
      labels: {version, app: id},
    });
  }
}

const currentNamespace = process.env.DEPLOY_NAMESPACE ? process.env.DEPLOY_NAMESPACE.toString() : 'default';

if (!process.env.MICRO_APP_NAME) {
  throw new Error('ENV MICRO_APP_NAME Undefined');
}
const microApp = process.env.MICRO_APP_NAME.toString()

const app = new App();
new AppChart(app, microApp, {namespace: currentNamespace});
app.synth();
