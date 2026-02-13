#!/bin/bash

echo "🗑️  Dropping existing database..."
psql postgres -c "DROP DATABASE IF EXISTS fintrack;"
echo ""

echo "✨ Creating new database..."
psql postgres -c "CREATE DATABASE fintrack;"
echo ""

echo "🔑 Granting privileges..."
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintrack TO fintrack_user;"
echo ""

echo "📋 Running schema.sql..."
psql fintrack -f server/src/schema.sql
echo ""

echo "🔑 Granting table privileges..."
psql fintrack -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fintrack_user;"
psql fintrack -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fintrack_user;"
echo ""

echo "🌱 Running seed.sql..."
psql fintrack -f server/src/seed.sql
echo ""

echo "✅ Database reset complete!"
echo ""
echo "📊 Sample data loaded:"
echo "  Subscriptions:"
echo "    - Netflix (Entertainment, Monthly, Active)"
echo "    - Spotify (Entertainment, Monthly, Trial)"
echo "    - Adobe Creative Cloud (Other, Monthly, Canceled)"
echo "    - Car Insurance (Transportation, Quarterly, Active)"
echo ""
echo "  Expenses (13 items across all categories)"
echo "  Budgets (6 categories with monthly limits)"
echo ""
