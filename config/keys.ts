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
}


const stage = process.env.STAGE || 'beta';
const replicas = stage == 'prod' ? 3 : 1;
const importEnvNames = process.env.IMPORT_ENV_NAMES ? process.env.IMPORT_ENV_NAMES.split(',') : ['STAGE'];

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
};
