import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { AppService } from './lib/app-service';
import config from './config';

export class AppChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const cfg = config();

    const port = cfg.port;
    const portName = cfg.portName;
    const version = cfg.version;

    if (cfg.imageName == '') {
      throw new Error('ENV IMAGE_NAME Undefined');
    }

    if (cfg.app == '') {
      throw new Error('ENV APP_NAME Undefined');
    }

    let image =  cfg.imageName;

    if (cfg.imageTag) {
      image = image + ':' + cfg.imageTag;
    }

    const app = cfg.app;

    new AppService(this, id, { 
      app,
      image,
      ...props,
      replicas: 1, 
      portName,
      port,
      labels: {version, app: id},
      metrics: {
        scrape: true
      }
    });
  }
}


const cfg = config();

const app = new App();
new AppChart(app, cfg.service, {namespace: cfg.namespace});
app.synth();
