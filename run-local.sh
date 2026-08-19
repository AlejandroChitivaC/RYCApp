#!/usr/bin/env bash
# Levanta backend (Spring Boot) y frontend (Vite) en desarrollo local.
#
# Uso:
#   ./run-local.sh           # OTP solo en logs del backend
#   ./run-local.sh --local   # Perfil Spring local (SMTP en application-local.yml)
#
# Requisitos: Java 21, Maven, Node.js, npm, MySQL con base rycapp en localhost:3306

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

USE_LOCAL=false
PIDS=()

usage() {
  cat <<EOF
Uso: $(basename "$0") [--local]

  --local   Activa el perfil Spring "local" (correo SMTP vía application-local.yml)
  -h, --help  Muestra esta ayuda

Requisitos:
  - MySQL en localhost:3306, base de datos "rycapp"
  - Java 21, Maven, Node.js y npm en PATH
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local) USE_LOCAL=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Opción desconocida: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: no se encontró '$1' en PATH." >&2
    exit 1
  fi
}

kill_process_tree() {
  local pid=$1
  if [[ -z "$pid" ]]; then
    return
  fi

  if command -v taskkill >/dev/null 2>&1 && [[ "${OSTYPE:-}" == msys* || "${OSTYPE:-}" == cygwin* || "${OS:-}" == Windows_NT ]]; then
    taskkill //F //T //PID "$pid" >/dev/null 2>&1 || true
    return
  fi

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
  fi

  if command -v pkill >/dev/null 2>&1; then
    pkill -P "$pid" >/dev/null 2>&1 || true
  fi
}

cleanup() {
  echo ""
  echo "Deteniendo servicios..."

  for pid in "${PIDS[@]}"; do
    kill_process_tree "$pid"
  done

  wait 2>/dev/null || true
  echo "Servicios detenidos."
}

trap cleanup EXIT INT TERM

require_cmd java
require_cmd mvn
require_cmd node
require_cmd npm

if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "Error: ejecuta este script desde la raíz del repositorio." >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "Instalando dependencias del frontend..."
  (cd "$FRONTEND_DIR" && npm install)
fi

MAVEN_ARGS=(spring-boot:run)
if [[ "$USE_LOCAL" == true ]]; then
  if [[ ! -f "$BACKEND_DIR/src/main/resources/application-local.yml" ]]; then
    echo "Aviso: --local requiere backend/src/main/resources/application-local.yml"
    echo "       Copia application-local.example.yml y configura Brevo."
  fi
  MAVEN_ARGS+=(-Dspring-boot.run.profiles=local)
fi

echo "Iniciando backend en http://localhost:8080 ..."
(
  cd "$BACKEND_DIR"
  mvn "${MAVEN_ARGS[@]}"
) &
PIDS+=($!)

echo "Esperando unos segundos antes de levantar el frontend..."
sleep 5

echo "Iniciando frontend en http://localhost:5173 ..."
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
PIDS+=($!)

echo ""
echo "Proyecto en marcha. Pulsa Ctrl+C para detener todo."
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:8080"
if [[ "$USE_LOCAL" == false ]]; then
  echo "  OTP sin correo: revisa los logs del backend."
fi
echo ""

wait -n 2>/dev/null || wait
