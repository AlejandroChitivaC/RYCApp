import * as crypto from 'crypto';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createBackend } from './backend';
import { createTables } from './database';
import { createFrontend } from './frontend';
import { createAccessLogsBucket } from './logs';
import { applyNagSuppressions } from './nag';

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

    const accessLogs = createAccessLogsBucket(this, retain);
    const tables = createTables(this, retain);
    const backend = createBackend(this, {
      tables,
      retain,
      originVerifySecret,
      accessLogs,
    });
    const frontend = createFrontend(this, {
      apiFunctionUrl: backend.functionUrl,
      originVerifySecret,
      accessLogs,
    });
    applyNagSuppressions({
      stack: this,
      accessLogs,
      distribution: frontend.distribution,
      backendSecret: backend.backendSecret,
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
