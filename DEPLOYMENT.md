# 🚀 PSC 119 - Deployment Guide

Complete guide for deploying PSC 119 to production environments.

## 📋 Pre-Deployment Checklist

- [ ] Node.js v16+ installed on server
- [ ] PostgreSQL v13+ installed and configured
- [ ] Domain name configured (e.g., psc119.id)
- [ ] SSL certificate ready
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring tools setup

## 🎯 Deployment Options

### Option 1: VPS/Cloud Server (Recommended)
- DigitalOcean, AWS EC2, Google Cloud, Azure
- Full control over environment
- Custom configuration

### Option 2: Platform-as-a-Service
- Heroku, Railway, Render
- Simpler deployment
- Limited configuration

### Option 3: Containerized (Docker)
- Docker + Docker Compose
- Consistent environments
- Easy scaling

---

## 🔧 Option 1: VPS Deployment (Ubuntu 22.04)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 2: PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE psc119_db;
CREATE USER psc119 WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE psc119_db TO psc119;
\q

# Configure PostgreSQL for remote connections (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host    all    all    0.0.0.0/0    md5

sudo systemctl restart postgresql
```

### Step 3: Deploy Backend

```bash
# Create app directory
sudo mkdir -p /var/www/psc119
sudo chown $USER:$USER /var/www/psc119
cd /var/www/psc119

# Clone repository (or upload files)
git clone https://github.com/yourusername/psc119.git .

# Install dependencies
npm install --production

# Create production .env
nano .env
```

**Production `.env`:**
```env
NODE_ENV=production
PORT=8080

DB_HOST=localhost
DB_PORT=5432
DB_USER=psc119
DB_PASS=your_secure_password
DB_NAME=psc119_db

JWT_SECRET=your_very_secure_jwt_secret_change_this
JWT_EXPIRES_IN=24h

SSE_TIMEOUT=300000
UPLOAD_DIR=/var/www/psc119/uploads
MAX_FILE_SIZE=5242880

CORS_ORIGIN=https://psc119.id
```

```bash
# Create uploads directory
mkdir -p /var/www/psc119/uploads/reports
mkdir -p /var/www/psc119/uploads/proofs

# Start database (sync tables)
NODE_ENV=production node src/index.js
# Stop after tables are created (Ctrl+C)

# Seed database
node src/scripts/seed.js

# Start with PM2
pm2 start src/index.js --name psc119-api
pm2 save
pm2 startup
```

### Step 4: Deploy Frontend

```bash
# Build frontend locally or on server
cd /var/www/psc119/frontend-public

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to web directory
sudo mkdir -p /var/www/psc119-web
sudo cp -r dist/* /var/www/psc119-web/
```

### Step 5: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/psc119
```

**Nginx Configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name psc119.id www.psc119.id;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name psc119.id www.psc119.id;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/psc119.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/psc119.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /var/www/psc119-web;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSE endpoint (special handling)
    location /api/stream {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 24h;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Increase upload size
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/psc119 /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d psc119.id -d www.psc119.id

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

### Step 7: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 8: Monitoring & Logs

```bash
# View PM2 logs
pm2 logs psc119-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🐳 Option 2: Docker Deployment

### Create Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "src/index.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: psc119_db
      POSTGRES_USER: psc119
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_USER: psc119
      DB_PASS: ${DB_PASS}
      DB_NAME: psc119_db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend-public/dist:/usr/share/nginx/html:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

---

## 🔐 Security Hardening

### 1. Environment Variables
```bash
# Never commit .env to git
# Use environment-specific configs
# Rotate secrets regularly
```

### 2. Database Security
```bash
# Use strong passwords
# Restrict PostgreSQL access
# Enable SSL for database connections
# Regular backups
```

### 3. Application Security
```bash
# Keep dependencies updated
npm audit fix

# Use Helmet for security headers (already included)
# Implement rate limiting (already included)
# Validate all inputs
# Sanitize user content
```

### 4. Server Security
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Use SSH keys instead of passwords
# Keep system updated
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install -y fail2ban
```

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Setup PM2 web dashboard
pm2 install pm2-server-monit
```

### 2. Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-psc119.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/psc119"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U psc119 psc119_db | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/psc119/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-psc119.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-psc119.sh
```

### 3. Log Rotation

```bash
# Nginx logs already rotated
# PM2 logs use pm2-logrotate (installed above)
```

---

## 🔄 Updates & Maintenance

### Updating Application

```bash
# Pull latest code
cd /var/www/psc119
git pull origin main

# Install new dependencies
npm install --production

# Rebuild frontend
cd frontend-public
npm install
npm run build
sudo cp -r dist/* /var/www/psc119-web/

# Restart backend
cd ..
pm2 restart psc119-api

# Clear Nginx cache (if any)
sudo systemctl reload nginx
```

### Database Migration

```bash
# For schema changes, create migration scripts
# Run migrations before restarting app
node src/scripts/migrate.js
```

---

## 📈 Performance Optimization

### 1. Enable Gzip in Nginx

Already included in config above with `gzip on`.

### 2. Use CDN for Static Assets

Configure CDN (CloudFlare, AWS CloudFront) to serve `/uploads` and frontend assets.

### 3. Database Optimization

```sql
-- Create indexes (already in models)
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_assignments_assigned_to ON assignments(assigned_to);
```

### 4. Caching Strategy

Consider adding Redis for:
- Session management
- Frequently accessed data
- SSE connection state

---

## 🆘 Troubleshooting

### Backend not starting
```bash
pm2 logs psc119-api
# Check database connection
# Verify .env variables
```

### Database connection failed
```bash
# Test PostgreSQL connection
psql -U psc119 -d psc119_db -h localhost
# Check credentials in .env
```

### Nginx 502 Bad Gateway
```bash
# Ensure backend is running
pm2 status
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew
# Restart Nginx
sudo systemctl restart nginx
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] API endpoints responding correctly
- [ ] Database seeded with initial data
- [ ] File uploads working
- [ ] SSE connections stable
- [ ] Backups configured and tested
- [ ] Monitoring alerts setup
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Deployment Complete! 🎉**

Your PSC 119 system is now live and ready to save lives.
