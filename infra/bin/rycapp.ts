#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RycAppStack } from '../lib/rycapp-stack';

const app = new cdk.App();

const stack = new RycAppStack(app, 'RycAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'RYCApp: CloudFront + S3 + Lambda + DynamoDB',
});
cdk.Tags.of(stack).add('Project', 'RYCApp');
cdk.Tags.of(stack).add('App', 'rycapp');
