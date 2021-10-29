import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { AppService } from './lib/app-service';
import config from './config';

export class AppChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const cfg = config();

    const { port, portName, version, imageName, imageTag, app } = cfg;

    if (imageName == '') {
      throw new Error('ENV IMAGE_NAME Undefined');
    }

    if (app == '') {
      throw new Error('ENV APP_NAME Undefined');
    }

    let image = imageName;

    if (imageTag) {
      image = image + ':' + imageTag;
    }

    new AppService(this, id, {
      app,
      image,
      ...props,
      replicas: 1,
      portName,
      port,
      labels: { version, app: id },
      metrics: cfg.metrics
    });
  }
}

const cfg = config();

const app = new App();
new AppChart(app, cfg.service, { namespace: cfg.namespace });
app.synth();
