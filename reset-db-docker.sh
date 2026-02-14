#!/bin/bash

CONTAINER="fintrack_postgres"
DB="fintrack"
USER="fintrack_user"

echo "**Dropping existing database..."
docker exec -i $CONTAINER psql -U $USER -d postgres -c "DROP DATABASE IF EXISTS $DB;"
echo ""

echo "**Creating new database..."
docker exec -i $CONTAINER psql -U $USER -d postgres -c "CREATE DATABASE $DB;"
echo ""

echo "**Granting privileges..."
docker exec -i $CONTAINER psql -U $USER -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB TO $USER;"
echo ""

echo "Running schema.sql..."
docker exec -i $CONTAINER psql -U $USER -d $DB -v ON_ERROR_STOP=1 < server/src/schema.sql
echo ""

echo "**Granting table privileges..."
docker exec -i $CONTAINER psql -U $USER -d $DB -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $USER;"
docker exec -i $CONTAINER psql -U $USER -d $DB -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $USER;"
echo ""

echo "**Running seed.sql..."
docker exec -i $CONTAINER psql -U $USER -d $DB -v ON_ERROR_STOP=1 < server/src/seed.sql
echo ""

echo "**Database reset complete!"
echo ""
echo "**Sample data loaded:"
echo "  Subscriptions:"
echo "    - Netflix (Entertainment, Monthly, Active)"
echo "    - Spotify (Entertainment, Monthly, Trial)"
echo "    - Adobe Creative Cloud (Other, Monthly, Canceled)"
echo "    - Car Insurance (Transportation, Quarterly, Active)"
echo ""
echo "  Expenses (13 items across all categories)"
echo "  Budgets (6 categories with monthly limits)"
echo ""
