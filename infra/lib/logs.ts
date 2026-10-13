import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { bucketName } from './names';

export function createAccessLogsBucket(scope: Construct, retain: boolean): s3.Bucket {
  return new s3.Bucket(scope, 'AccessLogs', {
    bucketName: bucketName(scope, 'logs'),
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
    removalPolicy: retain ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    autoDeleteObjects: !retain,
    lifecycleRules: [
      {
        id: 'expire-logs',
        expiration: Duration.days(90),
      },
    ],
  });
}
