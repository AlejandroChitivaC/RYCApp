import * as path from 'path';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { RycTables } from './database';
import { bucketName, functionName } from './names';

export interface BackendResult {
  apiAlias: lambda.Alias;
  functionUrl: lambda.FunctionUrl;
  ticketsBucket: s3.Bucket;
  originVerifySecret: string;
  backendSecret: secretsmanager.ISecret;
}

export interface BackendProps {
  tables: RycTables;
  retain: boolean;
  originVerifySecret: string;
}

function tableEnv(tables: RycTables): Record<string, string> {
  return {
    TABLE_USUARIOS: tables.usuarios.tableName,
    TABLE_ROLES: tables.roles.tableName,
    TABLE_LINEAS_NEGOCIO: tables.lineasNegocio.tableName,
    TABLE_MATERIALES: tables.materiales.tableName,
    TABLE_TIPOS_COSTO: tables.tiposCosto.tableName,
    TABLE_PROVEEDORES: tables.proveedores.tableName,
    TABLE_VEHICULOS: tables.vehiculos.tableName,
    TABLE_OPERACIONES: tables.operaciones.tableName,
    TABLE_COSTOS: tables.costos.tableName,
    TABLE_TICKETS: tables.tickets.tableName,
    TABLE_TICKET_AUDITORIA: tables.ticketAuditoria.tableName,
    TABLE_FACTURAS_SIIGO: tables.facturasSiigo.tableName,
  };
}

function grantTables(fn: lambda.IFunction, tables: RycTables): void {
  for (const t of Object.values(tables)) {
    t.grantReadWriteData(fn);
  }
}

export function createBackend(scope: Construct, props: BackendProps): BackendResult {
  const ticketsBucket = new s3.Bucket(scope, 'TicketsPdf', {
    bucketName: bucketName(scope, 'tickets'),
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    removalPolicy: props.retain ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    autoDeleteObjects: !props.retain,
    cors: [
      {
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      },
    ],
  });

  // JWT aleatorio en el primer deploy. No cambiar este template después:
  // CloudFormation regenera el secreto si cambia GenerateSecretString.
  // Siigo / SMTP / admin se editan en la consola de AWS, no aquí.
  const backendSecret = new secretsmanager.Secret(scope, 'BackendSecret', {
    secretName: 'rycapp/backend',
    description: 'JWT, SMTP y Siigo para el backend de RYCApp',
    removalPolicy: props.retain ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        'app.siigo.username': '',
        'app.siigo.access-key': '',
        'app.siigo.partner-id': 'RYCApp',
        'spring.mail.host': 'smtp-relay.brevo.com',
        'spring.mail.port': '587',
        'spring.mail.username': '',
        'spring.mail.password': '',
        'app.mail.from': 'noreply@rycapp.local',
        'app.bootstrap.admin.enabled': 'false',
        'app.bootstrap.admin.email': '',
        'app.bootstrap.admin.password': '',
      }),
      generateStringKey: 'app.jwt.secret',
      excludeCharacters: '"\\',
      passwordLength: 48,
    },
  });

  const jarPath = path.join(__dirname, '..', '..', 'backend', 'target', 'rycapp-backend-0.0.1-SNAPSHOT.jar');

  const commonEnv: Record<string, string> = {
    ...tableEnv(props.tables),
    TICKETS_BUCKET: ticketsBucket.bucketName,
    SPRING_CONFIG_IMPORT: 'optional:aws-secretsmanager:rycapp/backend',
    JAVA_TOOL_OPTIONS: '-XX:+TieredCompilation -XX:TieredStopAtLevel=1',
  };

  const apiFn = new lambda.Function(scope, 'ApiFn', {
    functionName: functionName('api'),
    runtime: lambda.Runtime.JAVA_21,
    architecture: lambda.Architecture.X86_64,
    handler: 'com.rycapp.lambda.StreamLambdaHandler::handleRequest',
    code: lambda.Code.fromAsset(jarPath),
    memorySize: 2048,
    timeout: Duration.seconds(29),
    snapStart: lambda.SnapStartConf.ON_PUBLISHED_VERSIONS,
    environment: {
      ...commonEnv,
      APP_ORIGIN_VERIFY_SECRET: props.originVerifySecret,
      SERVER_PORT: '0',
    },
  });

  const apiVersion = apiFn.currentVersion;
  const apiAlias = new lambda.Alias(scope, 'ApiLive', {
    aliasName: 'live',
    version: apiVersion,
  });

  const functionUrl = apiAlias.addFunctionUrl({
    authType: lambda.FunctionUrlAuthType.NONE,
    invokeMode: lambda.InvokeMode.BUFFERED,
    cors: {
      allowedOrigins: ['*'],
      allowedMethods: [lambda.HttpMethod.ALL],
      allowedHeaders: ['*'],
    },
  });

  const syncFn = new lambda.Function(scope, 'SiigoSyncFn', {
    functionName: functionName('siigo-sync'),
    runtime: lambda.Runtime.JAVA_21,
    architecture: lambda.Architecture.X86_64,
    handler: 'com.rycapp.lambda.SiigoSyncHandler::handleRequest',
    code: lambda.Code.fromAsset(jarPath),
    memorySize: 1024,
    timeout: Duration.minutes(5),
    environment: {
      ...commonEnv,
      SPRING_MAIN_WEB_APPLICATION_TYPE: 'none',
    },
  });

  grantTables(apiAlias, props.tables);
  grantTables(syncFn, props.tables);
  ticketsBucket.grantReadWrite(apiAlias);
  backendSecret.grantRead(apiAlias);
  backendSecret.grantRead(syncFn);

  apiAlias.addToRolePolicy(new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [ticketsBucket.arnForObjects('tickets/*')],
  }));

  new events.Rule(scope, 'SiigoSyncRule', {
    ruleName: functionName('siigo-sync-15m'),
    schedule: events.Schedule.rate(Duration.minutes(15)),
    targets: [new targets.LambdaFunction(syncFn)],
  });

  return {
    apiAlias,
    functionUrl,
    ticketsBucket,
    originVerifySecret: props.originVerifySecret,
    backendSecret,
  };
}
