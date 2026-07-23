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
    sys.stdout.buffer.write(f">>> {cmd}\n".encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        sys.stdout.buffer.write(out.encode('utf-8')[:3000])
        sys.stdout.buffer.write(b'\n')
    if err:
        sys.stdout.buffer.write(b'  STDERR: ')
        sys.stdout.buffer.write(err.encode('utf-8')[:1000])
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()
    return out

# Build already ran (npx next build). Now start PM2
print("=== Starting PM2 ===")
run("pm2 delete neuro 2>/dev/null; true")
run("cd /opt/neuro && pm2 start 'npx next start --hostname 0.0.0.0 -p 3000' --name neuro", timeout=30)
run("pm2 save")
run("pm2 startup systemd -u root --hp /root 2>/dev/null; true")

# Nginx
print("=== Nginx ===")
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
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
    location ~ /\\. { deny all; }
}
NGINXEOF""", timeout=10)
run("nginx -t")
run("systemctl reload nginx")

# Seed
print("=== Seed ===")
time.sleep(5)
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed", timeout=15)
time.sleep(2)

# Test
print("=== Test ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/screening")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/telegram-app")
run("pm2 status")

print("=== DONE ===")
client.close()
