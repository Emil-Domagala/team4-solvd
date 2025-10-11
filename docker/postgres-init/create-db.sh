#!/bin/bash
set -e
set -x

# Wait until Postgres is ready
until pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  echo "Waiting for Postgres..."
  sleep 2
done

# Connect explicitly to the default 'postgres' database
DB_EXISTS=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Database ${POSTGRES_DB} does not exist. Creating..."
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE ${POSTGRES_DB};"
else
  echo "Database ${POSTGRES_DB} already exists."
fi
