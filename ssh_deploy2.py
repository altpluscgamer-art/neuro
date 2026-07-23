import paramiko
import time
import sys

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=10)

def run(cmd, timeout=300):
    print(f">>> {cmd}", flush=True)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        for line in out.split('\n')[:30]:
            print(f"  {line}", flush=True)
    if err:
        for line in err.split('\n')[:10]:
            print(f"  E: {line}", flush=True)
    print(flush=True)
    return out

# Fix: build with npx next build (npm run build fails because next not in PATH)
print("=== Building with npx ===")
run("cd /opt/neuro && npx next build", timeout=300)

print("=== Starting PM2 ===")
run("pm2 delete neuro 2>/dev/null; true")
run("cd /opt/neuro && pm2 start 'npx next start --hostname 0.0.0.0 -p 3000' --name neuro", timeout=30)
run("pm2 save")
run("pm2 startup systemd -u root --hp /root 2>/dev/null; true")

# Update Nginx
print("=== Updating Nginx ===")
run("""cat > /etc/nginx/sites-available/govless << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name mybestsite.com.ng;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

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

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;

    location ~ /\\. { deny all; }
    location = /robots.txt { allow all; log_not_found off; access_log off; }
    location = /favicon.ico { log_not_found off; access_log off; }
}
NGINXEOF""", timeout=10)
run("nginx -t")
run("systemctl reload nginx")

# Seed
print("=== Seeding ===")
time.sleep(5)
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed", timeout=15)
time.sleep(2)

# Test
print("=== Testing ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/screening")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/telegram-app")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/")

print("=== DONE ===", flush=True)
client.close()
