import { Stack } from 'aws-cdk-lib';
import { NagPackSuppression, NagSuppressions } from 'cdk-nag';
import { IConstruct } from 'constructs';

export interface NagTargets {
  stack: Stack;
  accessLogs: IConstruct;
  distribution: IConstruct;
  backendSecret: IConstruct;
}

function suppressWhere(
  stack: Stack,
  matches: (path: string) => boolean,
  suppressions: NagPackSuppression[],
): void {
  const found = stack.node.findAll().filter((child) => matches(child.node.path));
  if (found.length === 0) {
    throw new Error(`cdk-nag: ningún recurso coincide con la supresión ${suppressions.map((item) => item.id).join(', ')}.`);
  }
  NagSuppressions.addResourceSuppressions(found, suppressions, true);
}

export function applyNagSuppressions(targets: NagTargets): void {
  NagSuppressions.addStackSuppressions(
    targets.stack,
    [
      {
        id: 'AwsSolutions-IAM4',
        reason:
          'El rol de ejecución usa AWSLambdaBasicExecutionRole, limitada a los logs de la función. Los grants de datos van en políticas inline.',
        appliesTo: [
          'Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        ],
      },
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'El comodín de los grants de CDK cubre solo los objetos de un bucket o los índices de una tabla. La compuerta del pipeline rechaza Action * junto con Resource *.',
      },
    ],
    true,
  );

  NagSuppressions.addResourceSuppressions(
    targets.accessLogs,
    [
      {
        id: 'AwsSolutions-S1',
        reason:
          'Este bucket es el destino de los access logs. Enviar sus propios logs al mismo bucket crearía recursión.',
      },
    ],
    true,
  );

  NagSuppressions.addResourceSuppressions(
    targets.distribution,
    [
      {
        id: 'AwsSolutions-CFR1',
        reason:
          'La aplicación no restringe países. La restricción geográfica no forma parte del modelo de acceso.',
      },
      {
        id: 'AwsSolutions-CFR2',
        reason:
          'No se adjunta AWS WAF por su coste fijo mensual. CloudFront obliga HTTPS y la API solo acepta invocaciones firmadas por CloudFront.',
      },
      {
        id: 'AwsSolutions-CFR4',
        reason:
          'Sin dominio propio la distribución usa el certificado por defecto de CloudFront, cuya política queda fija en TLSv1. Subir el mínimo exige un certificado ACM.',
      },
    ],
    true,
  );

  suppressWhere(targets.stack, (path) => /(^|\/)(ApiFn|SiigoSyncFn)$/.test(path), [
    {
      id: 'AwsSolutions-L1',
      reason:
        'El backend se compila y prueba con Java 21. cdk-nag compara contra el runtime más nuevo del CDK instalado, que puede ir por delante de esa versión.',
    },
  ]);

  suppressWhere(targets.stack, (path) => path.includes('CDKBucketDeployment'), [
    {
      id: 'AwsSolutions-L1',
      reason:
        'Esta función la crea BucketDeployment de CDK para publicar el frontend. El runtime lo elige la librería.',
    },
  ]);

  NagSuppressions.addResourceSuppressions(
    targets.backendSecret,
    [
      {
        id: 'AwsSolutions-SMG4',
        reason:
          'El secreto no rota solo: rotar el JWT invalidaría las sesiones activas. La rotación es manual en Secrets Manager.',
      },
    ],
    true,
  );
}
