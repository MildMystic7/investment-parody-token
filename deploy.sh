#!/bin/bash

# Deployment Script for Investment Parody Token
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🚀 Investment Parody Token Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if environment is specified
if [ -z "$1" ]; then
    print_error "Please specify environment: ./deploy.sh [local|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "local" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment. Use 'local' or 'production'"
    exit 1
fi

print_info "Deploying to: $ENVIRONMENT environment"

# Check if .env file exists
if [ ! -f "backend_python/.env" ]; then
    print_warning ".env file not found. Copying from .env.example"
    cp backend_python/.env.example backend_python/.env
    print_warning "Please edit backend_python/.env with your actual values before continuing"
    exit 1
fi

# Function to deploy locally
deploy_local() {
    print_info "Starting local deployment..."
    
    # Install backend dependencies
    print_status "Installing Python dependencies..."
    cd backend_python
    pip install -r requirements.txt
    
    # Check if MySQL is being used
    if grep -q "ENVIRONMENT=production" .env; then
        print_info "Production mode detected - checking MySQL connection..."
        python3 -c "
import pymysql
import os
from dotenv import load_dotenv
load_dotenv()
try:
    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST'),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DATABASE')
    )
    print('✅ MySQL connection successful')
    conn.close()
except Exception as e:
    print(f'❌ MySQL connection failed: {e}')
    exit(1)
        "
        
        # Run migration if needed
        read -p "Do you want to run database migration? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Running database migration..."
            python migrate_to_mysql.py
        fi
    else
        print_status "Development mode - using SQLite"
    fi
    
    cd ..
    
    # Install frontend dependencies and build
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Building frontend for production..."
        npm run build
        print_status "Frontend built successfully. Files are in dist/ directory"
    else
        print_status "Starting frontend development server..."
        npm run dev &
        FRONTEND_PID=$!
        print_info "Frontend running on http://localhost:5173"
    fi
    
    cd ..
    cd backend_python
    
    # Start backend
    print_status "Starting backend server..."
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "Production mode: Use PM2 or similar process manager"
        print_info "Run: pm2 start app.py --name investment-token-api"
    else
        python app.py &
        BACKEND_PID=$!
        print_info "Backend running on http://localhost:3001"
    fi
    
    if [ "$ENVIRONMENT" != "production" ]; then
        print_status "Local deployment complete!"
        print_info "Frontend: http://localhost:5173"
        print_info "Backend: http://localhost:3001"
        print_info "Press Ctrl+C to stop servers"
        
        # Wait for Ctrl+C
        trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
        wait
    fi
}

# Function to deploy to production
deploy_production() {
    print_info "Starting production deployment..."
    
    # Check if we're on EC2 or preparing for EC2
    if [ -f "/etc/ec2_version" ] || [ -n "$EC2_INSTANCE_ID" ]; then
        print_status "EC2 instance detected"
        deploy_ec2
    else
        print_info "Preparing for AWS deployment..."
        prepare_aws_deployment
    fi
}

# Function to deploy on EC2
deploy_ec2() {
    print_status "Deploying on EC2 instance..."
    
    # Update system
    sudo yum update -y
    
    # Install dependencies
    sudo yum install python3.9 python3.9-pip git nginx -y
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    # Install Python dependencies
    cd backend_python
    python3.9 -m pip install -r requirements.txt
    
    # Run migration if needed
    print_status "Running database migration..."
    python3.9 migrate_to_mysql.py
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'investment-token-api',
    script: 'python3.9',
    args: 'app.py',
    cwd: '$(pwd)',
    env: {
      FLASK_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    pm2 startup
    pm2 save
    
    # Setup Nginx if not configured
    if [ ! -f "/etc/nginx/conf.d/investment-token.conf" ]; then
        print_status "Configuring Nginx..."
        sudo tee /etc/nginx/conf.d/investment-token.conf << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
EOF
        
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
    
    print_status "EC2 deployment complete!"
    print_info "Application is running on this EC2 instance"
    print_info "Check status with: pm2 status"
    print_info "View logs with: pm2 logs investment-token-api"
}

# Function to prepare AWS deployment
prepare_aws_deployment() {
    print_status "Preparing files for AWS deployment..."
    
    # Build frontend
    cd frontend
    npm install
    npm run build
    cd ..
    
    # Create deployment package
    print_status "Creating deployment package..."
    mkdir -p aws-deployment
    
    # Copy backend files
    cp -r backend_python aws-deployment/
    
    # Copy frontend build
    cp -r frontend/dist aws-deployment/frontend-build
    
    # Copy deployment scripts
    cp AWS_DEPLOYMENT_GUIDE.md aws-deployment/
    cp deploy.sh aws-deployment/
    
    # Create deployment instructions
    cat > aws-deployment/DEPLOY_TO_AWS.md << EOF
# Deploy to AWS Instructions

1. **Setup RDS MySQL Database**
   - Follow Step 1 in AWS_DEPLOYMENT_GUIDE.md
   - Note the RDS endpoint

2. **Launch EC2 Instance** 
   - Follow Step 3.1-3.2 in AWS_DEPLOYMENT_GUIDE.md
   - Upload this deployment package to EC2

3. **Configure Environment**
   - Edit backend_python/.env with your RDS endpoint and secrets
   - Run: ./deploy.sh production

4. **Setup S3 and CloudFront**
   - Upload frontend-build/* to S3
   - Configure CloudFront distribution
   - Follow Step 4 in AWS_DEPLOYMENT_GUIDE.md

5. **Test Deployment**
   - Verify backend API is accessible
   - Verify frontend loads from CloudFront
   - Test database connectivity

For detailed instructions, see AWS_DEPLOYMENT_GUIDE.md
EOF
    
    print_status "AWS deployment package created in aws-deployment/"
    print_info "Upload the aws-deployment/ folder to your EC2 instance"
    print_info "Then run ./deploy.sh production on the EC2 instance"
}

# Main deployment logic
case $ENVIRONMENT in
    "local")
        deploy_local
        ;;
    "production")
        deploy_production
        ;;
esac

print_status "Deployment completed successfully! 🎉" 