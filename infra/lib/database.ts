import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { tableName } from './names';

export interface RycTables {
  usuarios: dynamodb.Table;
  roles: dynamodb.Table;
  lineasNegocio: dynamodb.Table;
  materiales: dynamodb.Table;
  tiposCosto: dynamodb.Table;
  proveedores: dynamodb.Table;
  vehiculos: dynamodb.Table;
  operaciones: dynamodb.Table;
  costos: dynamodb.Table;
  tickets: dynamodb.Table;
  ticketAuditoria: dynamodb.Table;
  facturasSiigo: dynamodb.Table;
}

function table(
  scope: Construct,
  id: string,
  physicalName: string,
  partitionKey: string,
  sortKey: string | undefined,
  retain: boolean
): dynamodb.Table {
  return new dynamodb.Table(scope, id, {
    tableName: tableName(physicalName),
    partitionKey: { name: partitionKey, type: dynamodb.AttributeType.STRING },
    sortKey: sortKey
      ? { name: sortKey, type: dynamodb.AttributeType.STRING }
      : undefined,
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: retain ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: retain },
  });
}

function gsi(
  t: dynamodb.Table,
  name: string,
  partitionKey: string,
  sortKey?: string
): void {
  t.addGlobalSecondaryIndex({
    indexName: name,
    partitionKey: { name: partitionKey, type: dynamodb.AttributeType.STRING },
    sortKey: sortKey
      ? { name: sortKey, type: dynamodb.AttributeType.STRING }
      : undefined,
    projectionType: dynamodb.ProjectionType.ALL,
  });
}

export function createTables(scope: Construct, retain: boolean): RycTables {
  const usuarios = table(scope, 'Usuarios', 'usuarios', 'id', undefined, retain);
  gsi(usuarios, 'cedula-index', 'cedulaLower');
  gsi(usuarios, 'correo-index', 'correoLower');
  gsi(usuarios, 'estado-index', 'estado');

  const roles = table(scope, 'Roles', 'roles', 'id', undefined, retain);
  gsi(roles, 'descripcion-index', 'descripcionLower');

  const lineasNegocio = table(scope, 'LineasNegocio', 'lineas-negocio', 'id', undefined, retain);
  gsi(lineasNegocio, 'nombre-index', 'nombreLower');

  const materiales = table(scope, 'Materiales', 'materiales', 'id', undefined, retain);
  gsi(materiales, 'nombre-index', 'nombreLower');

  const tiposCosto = table(scope, 'TiposCosto', 'tipos-costo', 'id', undefined, retain);

  const proveedores = table(scope, 'Proveedores', 'proveedores', 'id', undefined, retain);
  gsi(proveedores, 'nit-index', 'nitLower');

  const vehiculos = table(scope, 'Vehiculos', 'vehiculos', 'id', undefined, retain);
  gsi(vehiculos, 'placa-index', 'placaLower');
  gsi(vehiculos, 'conductor-index', 'conductorId');

  const operaciones = table(scope, 'Operaciones', 'operaciones', 'id', undefined, retain);
  gsi(operaciones, 'estado-fecha-index', 'estado', 'fechaInsercion');

  const costos = table(scope, 'Costos', 'costos', 'id', undefined, retain);
  gsi(costos, 'categoria-fecha-index', 'categoria', 'fechaInsercion');

  const tickets = table(scope, 'Tickets', 'tickets', 'id', undefined, retain);
  gsi(tickets, 'hash-index', 'hashSha256');
  gsi(tickets, 'numero-index', 'numeroTicket');
  gsi(tickets, 'operacion-index', 'operacionId');

  const ticketAuditoria = table(scope, 'TicketAuditoria', 'ticket-auditoria', 'ticketId', 'sk', retain);

  const facturasSiigo = table(scope, 'FacturasSiigo', 'facturas-siigo', 'id', undefined, retain);
  gsi(facturasSiigo, 'operacion-index', 'operacionId');

  return {
    usuarios,
    roles,
    lineasNegocio,
    materiales,
    tiposCosto,
    proveedores,
    vehiculos,
    operaciones,
    costos,
    tickets,
    ticketAuditoria,
    facturasSiigo,
  };
}
