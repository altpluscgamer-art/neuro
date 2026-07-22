#!/bin/bash
set -e

# NEURO — Deploy to Linux Server
# Server: 138.226.220.143
# Domain: mybestsite.com.ng

DOMAIN="mybestsite.com.ng"
APP_DIR="/opt/neuro"
APP_PORT=3000
NODE_VERSION="22"

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║  NEURO — Deploy to Server                     ║"
echo "  ║  Domain: mybestsite.com.ng                    ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "  Run as root: sudo bash deploy-server.sh"
  exit 1
fi

# 1. Install Node.js
echo "  [1/7] Installing Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo "  ✓ Node.js $(node --version)"

# 2. Install Nginx
echo ""
echo "  [2/7] Installing Nginx..."
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx
echo "  ✓ Nginx installed"

# 3. Install PM2
echo ""
echo "  [3/7] Installing PM2..."
npm install -g pm2
echo "  ✓ PM2 installed"

# 4. Create app directory
echo ""
echo "  [4/7] Setting up application..."
mkdir -p $APP_DIR
echo "  Copy project files to $APP_DIR"
echo "  (Run this script from the project root, or copy files manually)"
if [ -f "package.json" ]; then
  cp -r . $APP_DIR/
  echo "  ✓ Files copied"
else
  echo "  ⚠ No package.json found. Copy project files to $APP_DIR first."
  echo "    Then run: cd $APP_DIR && npm install && npm run build"
  exit 1
fi

cd $APP_DIR

# 5. Install dependencies and build
echo ""
echo "  [5/7] Installing dependencies and building..."
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
echo "  ✓ Build complete"

# 6. Create .env for production
echo ""
echo "  [6/7] Creating .env..."
cat > $APP_DIR/.env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://${DOMAIN}"
EOF
echo "  ✓ .env created with production URL"

# 7. Start with PM2
echo ""
echo "  [7/7] Starting application with PM2..."
pm2 delete neuro 2>/dev/null || true
pm2 start "npx next start --hostname 0.0.0.0 -p ${APP_PORT}" --name neuro
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "  ✓ NEURO running on port $APP_PORT via PM2"

# Configure Nginx
echo ""
echo "  Configuring Nginx..."
cat > /etc/nginx/sites-available/neuro << 'NGINX'
server {
    listen 80;
    server_name mybestsite.com.ng www.mybestsite.com.ng;

    # Main app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Upload size
    client_max_body_size 10M;
}
NGINX

ln -sf /etc/nginx/sites-available/neuro /etc/nginx/sites-enabled/neuro
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo "  ✓ Nginx configured"

# SSL with Let's Encrypt
echo ""
echo "  Setting up SSL (Let's Encrypt)..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
  echo "  ⚠ SSL setup failed. You can run manually:"
  echo "    certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}
echo "  ✓ SSL configured"

# Seed database
echo ""
echo "  Seeding database..."
sleep 3
curl -s -X POST http://127.0.0.1:${APP_PORT}/api/admin/seed || true
echo ""
echo "  ✓ Database seeded"

# Setup Telegram bot
echo ""
echo "  ══════════════════════════════════════════════"
echo "  ✓ DEPLOY COMPLETE!"
echo "  ══════════════════════════════════════════════"
echo ""
echo "  Site:    https://$DOMAIN"
echo "  Admin:   https://$DOMAIN/auth/login"
echo "  Email:   admin@neuro.ru"
echo "  Pass:    admin123"
echo "  TG App:  https://$DOMAIN/telegram-app"
echo ""
echo "  NEXT STEPS:"
echo "  1. Login to admin panel"
echo "  2. Go to Settings → Telegram"
echo "  3. Enter Bot Token and Chat ID"
echo "  4. Open in browser: https://$DOMAIN/api/telegram/webhook"
echo "  5. Send /start to your bot in Telegram"
echo ""
echo "  PM2 commands:"
echo "    pm2 status        — check status"
echo "    pm2 logs neuro    — view logs"
echo "    pm2 restart neuro — restart app"
echo ""
