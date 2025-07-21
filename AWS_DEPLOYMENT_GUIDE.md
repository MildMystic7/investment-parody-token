# AWS Deployment Guide for Investment Parody Token

This guide will help you deploy the Investment Parody Token application to AWS using S3 for frontend hosting, EC2 for backend hosting, and RDS for MySQL database.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │      EC2        │    │   RDS MySQL     │
│   + S3 Bucket   │────│   Backend API   │────│    Database     │
│   (Frontend)    │    │   (Flask App)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** and **npm** installed
4. **Python 3.8+** installed
5. **Domain name** (optional, for custom domain)

## Step 1: Database Setup (RDS MySQL)

### 1.1 Create RDS MySQL Instance

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name investment-token-subnet-group \
    --db-subnet-group-description "Subnet group for investment token DB" \
    --subnet-ids subnet-12345 subnet-67890

# Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier investment-token-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --db-name investment_parody_token \
    --vpc-security-group-ids sg-12345678 \
    --db-subnet-group-name investment-token-subnet-group \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --publicly-accessible
```

### 1.2 Configure Security Group

Create a security group that allows:
- **Port 3306** (MySQL) from EC2 security group
- **Port 22** (SSH) from your IP
- **Port 80/443** (HTTP/HTTPS) from anywhere

### 1.3 Get RDS Endpoint

```bash
aws rds describe-db-instances \
    --db-instance-identifier investment-token-db \
    --query 'DBInstances[0].Endpoint.Address'
```

## Step 2: Migrate Database

### 2.1 Install MySQL Dependencies

```bash
cd backend_python
pip install -r requirements.txt
```

### 2.2 Create .env file for Migration

```bash
# Create .env file in backend_python/
cat > .env << EOF
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=YOUR_SECURE_PASSWORD
MYSQL_DATABASE=investment_parody_token
MYSQL_PORT=3306
EOF
```

### 2.3 Run Migration Script

```bash
cd backend_python
python migrate_to_mysql.py
```

## Step 3: EC2 Setup for Backend

### 3.1 Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
    --key-name investment-token-key \
    --query 'KeyMaterial' \
    --output text > investment-token-key.pem
chmod 400 investment-token-key.pem

# Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --count 1 \
    --instance-type t2.micro \
    --key-name investment-token-key \
    --security-group-ids sg-12345678 \
    --subnet-id subnet-12345 \
    --associate-public-ip-address
```

### 3.2 Connect and Setup EC2

```bash
# Connect to EC2
ssh -i investment-token-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Update system
sudo yum update -y

# Install Python 3.9
sudo yum install python3.9 python3.9-pip git -y

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-username/investment-parody-token.git
cd investment-parody-token/backend_python

# Install dependencies
python3.9 -m pip install -r requirements.txt

# Create production environment file
sudo nano /opt/investment-token/.env
```

### 3.3 Production Environment File

```bash
# /opt/investment-token/.env
ENVIRONMENT=production
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=YOUR_SECURE_PASSWORD
MYSQL_DATABASE=investment_parody_token
MYSQL_PORT=3306

# Twitter API Keys
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret

# JWT and Session Secrets
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Helius API Key for Solana
HELIUS_API_KEY=your_helius_api_key

# Frontend URL
FRONTEND_URL=https://your-cloudfront-distribution.cloudfront.net
```

### 3.4 Create PM2 Ecosystem File

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'investment-token-api',
    script: 'python3.9',
    args: 'app.py',
    cwd: '/home/ec2-user/investment-parody-token/backend_python',
    env: {
      FLASK_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '/opt/investment-token/.env'
  }]
};
EOF
```

### 3.5 Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo yum install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/conf.d/investment-token.conf << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

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

    # Handle preflight OPTIONS requests
    location ~* ^.*$ {
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 200;
        }
    }
}
EOF

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.6 Start Application

```bash
# Start the Flask app with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs investment-token-api
```

## Step 4: Frontend Deployment (S3 + CloudFront)

### 4.1 Build Frontend

```bash
cd frontend

# Update the API URL in your frontend code to point to your EC2 instance
# Edit src/services/authService.js and other files that make API calls
# Replace localhost:3001 with your EC2 public IP or domain

# Install dependencies and build
npm install
npm run build
```

### 4.2 Create S3 Bucket

```bash
# Create S3 bucket (bucket name must be globally unique)
aws s3 mb s3://investment-token-frontend-bucket-unique-name

# Enable static website hosting
aws s3 website s3://investment-token-frontend-bucket-unique-name \
    --index-document index.html \
    --error-document index.html

# Upload build files
aws s3 sync dist/ s3://investment-token-frontend-bucket-unique-name --delete

# Set bucket policy for public read access
aws s3api put-bucket-policy \
    --bucket investment-token-frontend-bucket-unique-name \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::investment-token-frontend-bucket-unique-name/*"
            }
        ]
    }'
```

### 4.3 Setup CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "'$(date +%s)'",
        "Comment": "Investment Token Frontend Distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-investment-token-frontend",
            "ViewerProtocolPolicy": "redirect-to-https",
            "MinTTL": 0,
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {"Forward": "none"}
            },
            "TrustedSigners": {
                "Enabled": false,
                "Quantity": 0
            }
        },
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-investment-token-frontend",
                    "DomainName": "investment-token-frontend-bucket-unique-name.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "Enabled": true,
        "PriceClass": "PriceClass_100"
    }'
```

## Step 5: Domain and SSL (Optional)

### 5.1 Request SSL Certificate

```bash
# Request ACM certificate
aws acm request-certificate \
    --domain-name your-domain.com \
    --domain-name *.your-domain.com \
    --validation-method DNS
```

### 5.2 Update CloudFront Distribution

Add your custom domain and SSL certificate to the CloudFront distribution.

### 5.3 Update DNS Records

Point your domain to the CloudFront distribution using CNAME or ALIAS records.

## Step 6: Environment Variables Update

Update your frontend environment variables to use production API URLs:

```bash
# frontend/.env.production
VITE_API_URL=https://api.your-domain.com
```

## Step 7: Monitoring and Logging

### 7.1 CloudWatch Setup

```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent -y

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 7.2 PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Step 8: Security Hardening

### 8.1 EC2 Security

```bash
# Update security groups to only allow necessary ports
# - Port 22 (SSH) from your IP only
# - Port 80/443 (HTTP/HTTPS) from CloudFront IP ranges
# - Port 3306 (MySQL) from EC2 security group only

# Enable fail2ban
sudo yum install epel-release -y
sudo yum install fail2ban -y
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 8.2 Database Security

```bash
# Enable encryption at rest
# Use VPC security groups
# Enable backup retention
# Enable Multi-AZ deployment for production
```

## Step 9: Backup and Recovery

### 9.1 Database Backups

RDS automatic backups are enabled by default. For additional protection:

```bash
# Create manual snapshot
aws rds create-db-snapshot \
    --db-instance-identifier investment-token-db \
    --db-snapshot-identifier investment-token-manual-backup-$(date +%Y%m%d)
```

### 9.2 Code Backups

```bash
# Setup automated deployment from GitHub
# Use AWS CodeDeploy for automated deployments
```

## Step 10: Cost Optimization

### 10.1 Reserved Instances

Consider purchasing Reserved Instances for EC2 and RDS for cost savings.

### 10.2 Auto Scaling

Setup Auto Scaling for EC2 instances based on demand.

### 10.3 S3 Lifecycle Policies

Configure S3 lifecycle policies to move old logs to cheaper storage classes.

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check security groups
   - Verify RDS endpoint
   - Test connectivity from EC2

2. **CORS Issues**
   - Update Nginx configuration
   - Check frontend API URLs
   - Verify environment variables

3. **SSL Certificate Issues**
   - Validate domain ownership
   - Check CloudFront configuration
   - Verify DNS records

### Useful Commands

```bash
# Check EC2 logs
pm2 logs investment-token-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -h

# Test database connection
mysql -h your-rds-endpoint.amazonaws.com -u admin -p investment_parody_token
```

## Deployment Checklist

- [ ] RDS MySQL instance created and configured
- [ ] Database migration completed successfully
- [ ] EC2 instance launched and configured
- [ ] Backend application deployed and running
- [ ] Nginx reverse proxy configured
- [ ] S3 bucket created and frontend uploaded
- [ ] CloudFront distribution configured
- [ ] Domain and SSL certificate setup (optional)
- [ ] Environment variables updated
- [ ] Security groups configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check application logs
   - Monitor resource usage
   - Review security logs

2. **Monthly**
   - Update system packages
   - Review AWS billing
   - Test backup recovery

3. **Quarterly**
   - Security audit
   - Performance optimization
   - Cost optimization review

## Support

For issues with this deployment:

1. Check the troubleshooting section
2. Review AWS documentation
3. Check application logs
4. Contact support team

---

**Important**: Replace all placeholder values (YOUR_PASSWORD, your-domain.com, etc.) with your actual values before deploying. 