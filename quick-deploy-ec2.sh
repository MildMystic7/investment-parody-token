#!/bin/bash
# Quick EC2 Deployment Script
# Run this on your EC2 instance after uploading your code

echo "🚀 Setting up Investment Parody Token on EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.9+ and Node.js
sudo apt install python3.9 python3.9-pip python3.9-venv git curl -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository (replace with your actual repo)
# git clone https://github.com/your-username/investment-parody-token.git
# cd investment-parody-token

# Setup backend
cd backend_python
python3.9 -m pip install -r requirements.txt

# Create production environment file
echo "📝 Copy your .env.production.template to .env and fill in the values"
echo "   - RDS endpoint"
echo "   - Twitter API keys" 
echo "   - Random JWT/Session secrets"
echo "   - Helius API key"

# Migrate database (run after setting up .env)
echo "🗄️  To migrate database: python3.9 migrate_to_mysql.py"

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'investment-token-api',
    script: 'python3.9',
    args: 'app.py',
    cwd: '/home/ubuntu/investment-parody-token/backend_python',
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

# Install and configure Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/investment-token << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 200;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/investment-token /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Start services
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Setup complete!"
echo "📋 Next steps:"
echo "   1. Fill in your .env file with actual values"
echo "   2. Run: python3.9 migrate_to_mysql.py"
echo "   3. Run: pm2 start ecosystem.config.js"
echo "   4. Run: pm2 startup && pm2 save"
echo "   5. Test: curl http://localhost/api/stats" 