import { AppServiceMetricsProps } from '../lib/app-service';

export interface IConfig {
  importEnvNames: string[];
  app: string;
  service: string;
  port: number;
  portName: string;
  version: string;
  imageName: string;
  imageTag: string;
  replicas: number;
  namespace: string;
  stage: string;
  metrics?: AppServiceMetricsProps;
}

const stage = process.env.STAGE || 'beta';
const replicas = stage == 'prod' ? 3 : 1;
const importEnvNames = process.env.IMPORT_ENV_NAMES ? process.env.IMPORT_ENV_NAMES.split(',') : ['STAGE'];
let metrics = {
  scrape: false,
  path: '',
  port: 0
};
switch (process.env.METRICS_SCRAPE) {
  case 'true':
    metrics.scrape = true;
    break;
  case 't':
    metrics.scrape = true;
    break;
  case 'TRUE':
    metrics.scrape = true;
    break;
  case 'T':
    metrics.scrape = true;
    break;
  case '1':
    metrics.scrape = true;
    break;
  default:
    break;
}

metrics.path = process.env.METRICS_PATH || metrics.path;
metrics.port = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT) : metrics.port;

export const Config: IConfig = {
  importEnvNames,
  app: process.env.APP || 'matrixworld',
  service: process.env.SERVICE || 'test',
  port: parseInt(process.env.PORT || '8000'),
  portName: process.env.PORT_NAME || 'http',
  version: process.env.VERSION || 'version',
  imageName: process.env.IMAGE_NAME || '',
  imageTag: process.env.IMAGE_TAG || '',
  replicas,
  namespace: process.env.DEPLOY_NAMESPACE || 'default',
  stage: process.env.STAGE || 'beta',
  metrics: metrics
};
