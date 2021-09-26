import { Construct } from 'constructs';
import { KubeNamespace } from '../imports/k8s';

export interface AppNamespaceProps {
    readonly labels?: { [key: string]: string }
}

export class AppNamespace extends Construct {
    constructor(scope: Construct, id: string, props: AppNamespaceProps) {
        super(scope, id);

        new KubeNamespace(this, id, {
            metadata: {
                labels: props.labels,
                name: id
            }
        });
    }
}