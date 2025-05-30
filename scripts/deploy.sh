#!/bin/bash

# ChurchConnect Deployment Script
# This script prepares the application for deployment to Vercel

echo "🚀 Preparing ChurchConnect for deployment..."

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ Error: $1 is not installed"
        echo "Please install $1 and try again"
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_command "node"
check_command "npm"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with your configuration"
    echo "Use .env.example as a template"
    exit 1
fi

# Generate secure secrets if they don't exist
echo "🔑 Generating secure secrets..."

# Function to generate a secure random string
generate_secret() {
    openssl rand -base64 32
}

# Check if JWT_SECRET is set
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2)
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production" ]; then
    NEW_JWT_SECRET=$(generate_secret)
    echo "Generated new JWT_SECRET: $NEW_JWT_SECRET"
    if [ -z "$JWT_SECRET" ]; then
        echo "JWT_SECRET=$NEW_JWT_SECRET" >> .env
    else
        sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" .env
    fi
    echo "✅ JWT_SECRET updated"
else
    echo "✅ JWT_SECRET already configured"
fi

# Check if ENCRYPTION_KEY is set
ENCRYPTION_KEY=$(grep "^ENCRYPTION_KEY=" .env | cut -d '=' -f2)
if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" = "your-encryption-key-32-chars-min" ]; then
    NEW_ENCRYPTION_KEY=$(generate_secret)
    echo "Generated new ENCRYPTION_KEY: $NEW_ENCRYPTION_KEY"
    if [ -z "$ENCRYPTION_KEY" ]; then
        echo "ENCRYPTION_KEY=$NEW_ENCRYPTION_KEY" >> .env
    else
        sed -i.bak "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$NEW_ENCRYPTION_KEY|" .env
    fi
    echo "✅ ENCRYPTION_KEY updated"
else
    echo "✅ ENCRYPTION_KEY already configured"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
source .env
node -e "
const mysql = require('mysql2/promise');
const connection = mysql.createConnection(process.env.DATABASE_URL);
connection.execute('SELECT 1').then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Initialize database if needed
echo "🗄️ Checking database schema..."
read -p "Do you want to initialize/update the database schema? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    chmod +x scripts/init-db.sh
    ./scripts/init-db.sh
    if [ $? -ne 0 ]; then
        echo "❌ Database initialization failed"
        exit 1
    fi
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Set environment variables in Vercel
echo "🌍 Setting up Vercel environment variables..."

DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2)
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2)
ENCRYPTION_KEY=$(grep "^ENCRYPTION_KEY=" .env | cut -d '=' -f2)

echo "Setting DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo "Setting JWT_SECRET..."
echo "$JWT_SECRET" | vercel env add JWT_SECRET production

echo "Setting ENCRYPTION_KEY..."
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY production

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your API endpoints"
    echo "2. Update your Flutter app's API base URL"
    echo "3. Test the complete authentication flow"
    echo "4. Set up monitoring and logging"
    echo ""
    echo "🔗 Your API is now live at: https://your-project.vercel.app/api"
    echo ""
    echo "🧪 Test endpoints:"
    echo "- POST /api/auth/login"
    echo "- POST /api/auth/register"
    echo "- GET /api/users"
    echo "- GET /api/members"
    echo "- GET /api/messages"
    echo "- GET /api/templates"
    echo "- GET /api/analytics"
    echo "- GET /api/automation"
else
    echo "❌ Deployment failed"
    echo "Please check the error messages above and try again"
    exit 1
fi
