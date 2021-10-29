import { Construct } from 'constructs';
import { Gateway, VirtualService, VirtualServiceSpecHttp, GatewaySpecServersTls } from '../imports/networking.istio.io';

export interface AppGatewayProps {
  /**
   * String namespace
   */
  readonly namespace?: string;

  /**
   * Gateway hosts
   */
  readonly hosts: string[];

  /**
   * port number @default 80
   */
  readonly port?: number;

  /**
   * protocol of port @default HTTP
   */
  readonly protocol?: string;

  readonly http?: VirtualServiceSpecHttp[];

  readonly tls?: GatewaySpecServersTls;
}

export class AppGateway extends Construct {
  constructor(scope: Construct, id: string, props: AppGatewayProps) {
    super(scope, id);

    const { namespace, protocol = 'HTTP', port: number = 80, http, tls, hosts } = props;

    const gatewayName = `${id}-gateway`;

    new Gateway(this, 'gateway', {
      metadata: {
        name: gatewayName,
        namespace
      },
      spec: {
        selector: {
          istio: 'ingressgateway'
        },
        servers: [
          {
            hosts,
            port: {
              number,
              name: protocol.toLocaleLowerCase(),
              protocol: protocol.toLocaleUpperCase()
            },
            tls
          }
        ]
      }
    });
    new VirtualService(this, 'virtualService', {
      metadata: {
        name: id,
        namespace
      },
      spec: {
        hosts,
        gateways: [gatewayName],
        http
      }
    });
  }
}
