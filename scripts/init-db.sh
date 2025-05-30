#!/bin/bash

# Database initialization script for ChurchConnect
# This script sets up the MySQL database schema on your Hostinger VPS

echo "🏗️  Initializing ChurchConnect Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with your database credentials"
    exit 1
fi

# Load environment variables
source .env

# Extract database details from DATABASE_URL
# Format: mysql://username:password@host:port/database
DB_URL=$DATABASE_URL
DB_HOST=$(echo $DB_URL | sed -n 's|mysql://[^:]*:[^@]*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo $DB_URL | sed -n 's|mysql://[^:]*:[^@]*@[^:]*:\([0-9]*\)/.*|\1|p')
DB_USER=$(echo $DB_URL | sed -n 's|mysql://\([^:]*\):.*|\1|p')
DB_PASS=$(echo $DB_URL | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo $DB_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "📡 Connecting to database: $DB_HOST:$DB_PORT"
echo "🗄️  Database: $DB_NAME"
echo "👤 User: $DB_USER"

# Test connection
echo "🔌 Testing database connection..."
mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS -e "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Create database if it doesn't exist
echo "🏗️  Creating database if it doesn't exist..."
mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"

# Execute schema
echo "📋 Executing database schema..."
mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS $DB_NAME < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
    
    # Show table count
    TABLE_COUNT=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES;" | wc -l)
    echo "📊 Created $((TABLE_COUNT - 1)) tables"
    
    echo ""
    echo "🎉 ChurchConnect database is ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update the default admin password"
    echo "2. Create your organization"
    echo "3. Deploy to Vercel: npm run deploy"
    echo ""
    echo "🔑 Default login credentials:"
    echo "Email: admin@churchconnect.com"
    echo "Password: admin123"
    echo "⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
    
else
    echo "❌ Error creating database schema"
    exit 1
fi
