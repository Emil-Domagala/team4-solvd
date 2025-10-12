#!/bin/bash
set -e
set -x

# Wait until Postgres is ready
until pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  echo "Waiting for Postgres..."
  sleep 2
done

# Create the user if it doesn't exist
USER_EXISTS=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USERNAME}'")
if [ "$USER_EXISTS" != "1" ]; then
  echo "User ${DB_USERNAME} does not exist. Creating..."
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER ${DB_USERNAME} WITH PASSWORD '${POSTGRES_PASSWORD}';"
fi

# Create the database if it doesn't exist
DB_EXISTS=$(psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'")
if [ "$DB_EXISTS" != "1" ]; then
  echo "Database ${POSTGRES_DB} does not exist. Creating..."
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${DB_USERNAME};"
else
  echo "Database ${POSTGRES_DB} already exists."
fi
