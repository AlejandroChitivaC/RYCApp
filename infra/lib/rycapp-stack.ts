import * as crypto from 'crypto';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createBackend } from './backend';
import { createTables } from './database';
import { createFrontend } from './frontend';

export class RycAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const retain = this.node.tryGetContext('retain') === 'true';
    this.tags.setTag('Project', 'RYCApp');
    const originVerifySecret =
      this.node.tryGetContext('originVerifySecret') ??
      crypto
        .createHash('sha256')
        .update(`${this.account ?? 'dev'}:${this.region}:rycapp-origin`)
        .digest('hex')
        .slice(0, 32);

    const tables = createTables(this, retain);
    const backend = createBackend(this, {
      tables,
      retain,
      originVerifySecret,
    });
    const frontend = createFrontend(this, {
      apiFunctionUrl: backend.functionUrl,
      originVerifySecret,
    });

    new CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${frontend.distribution.distributionDomainName}`,
    });
    new CfnOutput(this, 'ApiFunctionUrl', {
      value: backend.functionUrl.url,
    });
    new CfnOutput(this, 'TicketsBucket', {
      value: backend.ticketsBucket.bucketName,
    });
    new CfnOutput(this, 'BackendSecretName', {
      value: backend.backendSecret.secretName,
    });
  }
}
