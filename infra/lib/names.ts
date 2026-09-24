import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const APP = 'rycapp';

export function accountId(scope: Construct): string {
  return Stack.of(scope).account;
}

export function tableName(logical: string): string {
  return `${APP}-${logical}`;
}

export function bucketName(scope: Construct, purpose: string): string {
  return `${APP}-${accountId(scope)}-${purpose}`;
}

export function functionName(logical: string): string {
  return `${APP}-${logical}`;
}
