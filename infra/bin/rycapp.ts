#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagReportFormat } from 'cdk-nag';
import { RycAppStack } from '../lib/rycapp-stack';

const app = new cdk.App();
cdk.Aspects.of(app).add(
  new AwsSolutionsChecks({
    verbose: true,
    reports: true,
    logIgnores: true,
    reportFormats: [NagReportFormat.CSV, NagReportFormat.JSON],
  }),
);

const stack = new RycAppStack(app, 'RycAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'RYCApp: CloudFront + S3 + Lambda + DynamoDB',
});
cdk.Tags.of(stack).add('Project', 'RYCApp');
cdk.Tags.of(stack).add('App', 'rycapp');
