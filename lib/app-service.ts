import { Construct } from 'constructs';
import { KubeDeployment, KubeService, KubeConfigMap, KubeServiceAccount, Volume, VolumeMount  } from '../imports/k8s';
import { DestinationRule, VirtualService } from '../imports/networking.istio.io';

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
}

export interface ConfigProps {
    readonly path: string;
    readonly data: { [ key:string ]:string }
}

export class AppService extends Construct {
    constructor(scope: Construct, id: string, props: AppServiceProps) {
        super(scope, id);

        const port = props.port || 8000;
        const containerPort = props.port || 8000;
        const version = (props.labels && props.labels['version']) ? props.labels['version'] : 'v1';
        const app = (props.labels && props.labels['app']) ? props.labels['app'] : 'app';
        const service = app;
        const serviceLabels = { app, service };
        const replicas = props.replicas ?? 1;
        const namespace = props.namespace;
        const securityContext = props.user ? { runAsUser: props.user } : undefined
        const serviceAccountName = props.app + '-' + id;
        const volumes:Volume[] = []
        let volumneMounts: VolumeMount[] = []
        
        if (props.configData) {
            let data: { [key: string]: string } = {}
            props.configData.forEach((e:ConfigProps) => {
                volumneMounts.push({
                    name: app + "-cm",
                    mountPath: e.path,
                })
                data = {...data, ...e.data}
            });
            volumes.push({
                name: app + '-cm',
                configMap: {
                    name: app + '-cm',
                }
            })
            new KubeConfigMap(this, "configmap", {
                metadata: {
                    name: app + '-cm',
                    namespace
                },
                data,
            })
        }

        new KubeServiceAccount(this, 'serviceAccount', {
            metadata: {
                name: serviceAccountName,
                labels: {
                    account: app,
                }
            }
        })

        new KubeService(this, 'service', {
            metadata: {
                name: app,
                namespace,
                labels: serviceLabels
            },
            spec: {
                type: 'ClusterIP',
                ports: [{ port, name: props.portName }],
                selector: { app }
            }
        });

        new KubeDeployment(this, 'deployment', {
            metadata: {
                name: app + '-' + version,
                namespace,
                labels: props.labels,
            },
            spec: {
                replicas,
                selector: {
                    matchLabels: props.labels
                },
                template: {
                    metadata: { labels: { app, version} },
                    spec: {
                        serviceAccountName,
                        containers: [
                            {
                                name: app,
                                image: props.image,
                                ports: [{ containerPort }],
                                securityContext,
                                volumeMounts: volumneMounts
                            },
                        ],
                        volumes
                    }
                }
            }
        });

        new DestinationRule(this, 'destinationRule', {
            metadata: {
                name: app,
                namespace
            },
            spec: {
                host: app,
                subsets: [
                    {
                        name: version,
                        labels: {
                            version: version
                        }
                    }
                ]
            }
        })

        new VirtualService(this, 'virtualService', {
            metadata: {
                name: app,
                namespace
            },
            spec: {
                hosts: [app],
                http: [
                    {
                        route: [
                            {
                                destination: {
                                    host: app,
                                    subset: version
                                }
                            }
                        ]
                    }
                ]
            }
        })
    }
}
