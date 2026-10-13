import * as path from 'path';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { bucketName, functionName } from './names';

export interface FrontendResult {
  distribution: cloudfront.Distribution;
  siteBucket: s3.Bucket;
}

export interface FrontendProps {
  apiFunctionUrl: lambda.IFunctionUrl;
  originVerifySecret: string;
  accessLogs: s3.IBucket;
}

export function createFrontend(scope: Construct, props: FrontendProps): FrontendResult {
  const siteBucket = new s3.Bucket(scope, 'WebBucket', {
    bucketName: bucketName(scope, 'web'),
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    serverAccessLogsBucket: props.accessLogs,
    serverAccessLogsPrefix: 's3/web/',
  });

  const spaRewrite = new cloudfront.Function(scope, 'SpaRewrite', {
    functionName: functionName('spa-rewrite'),
    code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.indexOf('/api/') === 0) {
    return request;
  }
  if (uri.indexOf('.') !== -1) {
    return request;
  }
  request.uri = '/index.html';
  return request;
}
`),
  });

  const apiOrigin = origins.FunctionUrlOrigin.withOriginAccessControl(props.apiFunctionUrl, {
    customHeaders: {
      'X-Origin-Verify': props.originVerifySecret,
    },
  });

  const distribution = new cloudfront.Distribution(scope, 'Cdn', {
    comment: 'RYCApp portal (S3 + API Lambda)',
    defaultRootObject: 'index.html',
    logBucket: props.accessLogs,
    logFilePrefix: 'cloudfront/',
    defaultBehavior: {
      origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      functionAssociations: [
        {
          function: spaRewrite,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    },
    additionalBehaviors: {
      '/api/*': {
        origin: apiOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },
    },
  });

  const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  new s3deploy.BucketDeployment(scope, 'WebDeploy', {
    sources: [s3deploy.Source.asset(distPath)],
    destinationBucket: siteBucket,
    distribution,
    distributionPaths: ['/*'],
  });

  return { distribution, siteBucket };
}
