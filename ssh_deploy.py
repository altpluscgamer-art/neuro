import paramiko
import time

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=10)

def run(cmd, timeout=120):
    print(f">>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)
    if err:
        print(f"  STDERR: {err}")
    print()
    return out

# 1. Install Node.js 22
print("=== [1/8] Installing Node.js 22 ===")
run("curl -fsSL https://deb.nodesource.com/setup_22.x | bash -", timeout=60)
run("apt-get install -y nodejs", timeout=60)
run("node --version && npm --version")

# 2. Install PM2
print("=== [2/8] Installing PM2 ===")
run("npm install -g pm2", timeout=60)

# 3. Clone project
print("=== [3/8] Cloning project ===")
run("rm -rf /opt/neuro")
run("git clone https://github.com/altpluscgamer-art/neuro.git /opt/neuro", timeout=60)

# 4. Install dependencies
print("=== [4/8] Installing dependencies ===")
run("cd /opt/neuro && npm install", timeout=120)

# 5. Generate Prisma + migrate
print("=== [5/8] Prisma ===")
run("cd /opt/neuro && npx prisma generate", timeout=60)
run("cd /opt/neuro && npx prisma migrate deploy", timeout=60)

# 6. Create .env
print("=== [6/8] Creating .env ===")
run("""cat > /opt/neuro/.env << 'ENVEOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://mybestsite.com.ng"
ENVEOF""", timeout=10)
# Need to actually generate the secret
run("cd /opt/neuro && SECRET=$(openssl rand -base64 32) && sed -i \"s|\\\"\\$(openssl rand -base64 32)\\\"|\\\"$SECRET\\\"|\" .env && cat .env")

# 7. Build
print("=== [7/8] Building ===")
run("cd /opt/neuro && npm run build", timeout=120)

# 8. Start with PM2
print("=== [8/8] Starting PM2 ===")
run("pm2 delete neuro 2>/dev/null; true")
run("cd /opt/neuro && pm2 start \"npx next start --hostname 0.0.0.0 -p 3000\" --name neuro", timeout=30)
run("pm2 save")
run("pm2 startup systemd -u root --hp /root 2>/dev/null; true")

# 9. Update Nginx config — reverse proxy to Next.js
print("=== Updating Nginx ===")
new_nginx = """# goVLESS Pro mode + NEURO app
# Xray on port 443 with TLS, fallback to nginx:80
# Nginx:80 -> reverse proxy to Next.js:3000

server {
    listen 80;
    listen [::]:80;
    server_name mybestsite.com.ng;

    # Let's Encrypt ACME challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # NEURO app — reverse proxy to Next.js
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

    # Hide dotfiles
    location ~ /\\. { deny all; }
    location = /robots.txt { allow all; log_not_found off; access_log off; }
    location = /favicon.ico { log_not_found off; access_log off; }
}
"""

# Write new nginx config
run(f"cat > /etc/nginx/sites-available/govless << 'NGINXEOF'\n{new_nginx}NGINXEOF")
run("nginx -t")
run("systemctl reload nginx")

# 10. Wait and seed
print("=== Seeding database ===")
time.sleep(5)
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed")
time.sleep(2)

# 11. Test
print("=== Testing ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/screening")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/telegram-app")

print("\n=== DEPLOY COMPLETE ===")
print(f"Site: https://mybestsite.com.ng")
print(f"Admin: https://mybestsite.com.ng/auth/login")
print(f"TG App: https://mybestsite.com.ng/telegram-app")

client.close()
