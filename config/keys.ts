import { AppServiceMetricsProps } from '../lib/app-service';
import * as core from '@actions/core';
import { EnvVar } from '../imports/k8s';

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
  env: EnvVar[];
}

const stage = core.getInput('stage') || 'beta';
const replicas = stage == 'prod' ? 3 : 1;
const importEnvNames = core.getInput('import-env-names') ? core.getInput('import-env-names').split(',') : ['STAGE'];

let metrics = {
  scrape: ['true', 't', 'TRUE', 'T', '1'].includes(core.getInput('metrics-scrape')),
  path: core.getInput('metrics-path') || '',
  port: core.getInput('metrics-port') ? parseInt(core.getInput('metrics-port')) : 0
};

let env: EnvVar[] = [];

importEnvNames.forEach((k) => {
  env.push({
    name: k,
    value: process.env[k] || ''
  });
});

export const Config: IConfig = {
  importEnvNames,
  app: core.getInput('app') || 'matrixworld',
  service: core.getInput('service') || 'test',
  port: parseInt(core.getInput('port') || '8000'),
  portName: core.getInput('port-name') || 'http',
  version: core.getInput('version') || 'version',
  imageName: core.getInput('image-name') || '',
  imageTag: core.getInput('image-tag') || '',
  replicas,
  namespace: core.getInput('deploy-namespace') || 'default',
  stage: core.getInput('stage') || 'beta',
  metrics,
  env
};
