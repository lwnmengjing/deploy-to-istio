import { Construct } from 'constructs';
import {
  KubeDeployment,
  KubeService,
  KubeConfigMap,
  Volume,
  VolumeMount,
  KubeServiceAccount,
  EnvVar
} from '../imports/k8s';

export interface AppServiceProps {
  /**
   * Name of application
   */
  readonly app: string;

  /**
   * Labels to apply to all resources in this chart.
   *
   * @default - no common labels
   * @stability stable
   */
  readonly labels?: {
    [name: string]: string;
  };

  /**
   * The Docker image to use for this service.
   */
  readonly image: string;

  /**
   * Number of replicas.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * External port.
   *
   * @default 8000
   */
  readonly port?: number;

  readonly portName?: string;

  /**
   * String namespace
   */
  readonly namespace?: string;

  /**
   * Map config
   */
  readonly configData?: ConfigProps[];

  /**
   * User run as user
   */
  readonly user?: number;

  readonly env?: EnvVar[];

  readonly metrics?: AppServiceMetricsProps;
}

export interface AppServiceMetricsProps {
  /**
   * default false
   */
  readonly scrape: boolean;
  /**
   * default /metrics
   */
  readonly path?: string;
  /**
   * default 5000
   */
  readonly port?: number;
}

export interface ConfigProps {
  readonly path: string;
  readonly data: { [key: string]: string };
}

export class AppService extends Construct {
  constructor(scope: Construct, id: string, props: AppServiceProps) {
    super(scope, id);

    const {
      port = 8000,
      labels: { version = 'v1', app = id } = {},
      replicas = 1,
      namespace,
      user,
      app: appName,
      env,
      metrics,
      configData,
      portName,
      labels,
      image
    } = props;
    let ports = [{ containerPort: port }];
    const service = app;
    const serviceLabels = { app, service };
    const securityContext = user ? { runAsUser: user } : undefined;
    const serviceAccountName = appName + '-' + app;
    const volumes: Volume[] = [];
    const volumeMounts: VolumeMount[] = [];
    const templateAnnotations: { [key: string]: string } = {};

    if (metrics && metrics.scrape) {
      templateAnnotations['prometheus.io/scrape'] = 'true';
      templateAnnotations['prometheus.io/path'] = metrics.path || '/metrics';
      templateAnnotations['prometheus.io/port'] = metrics.port ? metrics.port.toString() : port.toString();
      if (metrics.port && metrics.port != port) {
        ports.push({ containerPort: metrics.port });
      }
    }

    if (configData) {
      let data: { [key: string]: string } = {};
      const volumeMountsName = `${app}-cm`;
      configData.forEach((e: ConfigProps) => {
        volumeMounts.push({
          name: volumeMountsName,
          mountPath: e.path
        });
        data = { ...data, ...e.data };
      });
      volumes.push({
        name: volumeMountsName,
        configMap: {
          name: volumeMountsName
        }
      });
      new KubeConfigMap(this, 'configmap', {
        metadata: {
          name: volumeMountsName,
          namespace
        },
        data
      });
    }

    new KubeServiceAccount(this, 'serviceAccount', {
      metadata: {
        name: serviceAccountName,
        labels: {
          account: app
        }
      }
    });

    new KubeService(this, 'service', {
      metadata: {
        name: app,
        namespace,
        labels: serviceLabels
      },
      spec: {
        type: 'ClusterIP',
        ports: [{ port, name: portName }],
        selector: { app }
      }
    });

    new KubeDeployment(this, 'deployment', {
      metadata: {
        name: app + '-' + version,
        namespace,
        labels
      },
      spec: {
        replicas,
        selector: {
          matchLabels: labels
        },
        template: {
          metadata: {
            labels: { app, version },
            annotations: templateAnnotations
          },
          spec: {
            serviceAccountName,
            containers: [
              {
                name: app,
                image,
                ports,
                securityContext,
                volumeMounts,
                env
              }
            ],
            volumes
          }
        }
      }
    });
  }
}
