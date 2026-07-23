import paramiko
import sys
import time

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=30)

def run(cmd, timeout=600):
    sys.stdout.buffer.write(f">>> {cmd}\n".encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        lines = out.split('\n')
        for line in lines[-20:]:
            sys.stdout.buffer.write(line.encode('utf-8') + b'\n')
    sys.stdout.buffer.flush()
    return out

# Create swap file (2GB) to help npm install
print("=== CREATE SWAP ===")
run("fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 2>&1 | tail -3", timeout=120)
run("chmod 600 /swapfile")
run("mkswap /swapfile 2>&1 | tail -3", timeout=30)
run("swapon /swapfile 2>&1")
run("free -h")

# Clean up
print("=== CLEAN ===")
run("pm2 delete neuro 2>/dev/null; true")
run("rm -rf /opt/neuro /tmp/neuro-deploy.zip")
run("apt-get clean && rm -rf /var/cache/apt/archives/* /root/.npm/_cacache /tmp/*")
run("journalctl --vacuum-size=5M 2>/dev/null; true")
run("df -h / /run")

# Clone fresh
print("=== CLONE ===")
run("git clone https://github.com/altpluscgamer-art/neuro.git /opt/neuro 2>&1 | tail -5", timeout=120)

# Create .env
print("=== ENV ===")
run("""cd /opt/neuro && SECRET=$(openssl rand -base64 32) && cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="https://mybestsite.com.ng"
EOF
cat .env""")

# Install with swap available
print("=== NPM INSTALL ===")
run("cd /opt/neuro && npm install 2>&1 | tail -15", timeout=600)

# Check
print("=== CHECK ===")
run("ls /opt/neuro/node_modules/next/dist/bin/next 2>/dev/null && echo 'NEXT OK' || echo 'NO NEXT'")

# Prisma
print("=== PRISMA ===")
run("cd /opt/neuro && npx prisma generate 2>&1 | tail -3", timeout=120)
run("cd /opt/neuro && npx prisma migrate deploy 2>&1 | tail -5", timeout=60)

# Build
print("=== BUILD ===")
run("cd /opt/neuro && node node_modules/next/dist/bin/next build 2>&1 | tail -15", timeout=600)

# Check
print("=== BUILD CHECK ===")
run("cat /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD OK' || echo 'NO BUILD'")

# Start PM2
print("=== PM2 ===")
run("cd /opt/neuro && pm2 start 'node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(8)
run("pm2 logs neuro --lines 5 --nostream", timeout=15)

# Test
print("=== TEST ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null")

# Nginx
print("=== NGINX ===")
run("systemctl restart nginx 2>&1 || nginx 2>&1")
time.sleep(2)
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null")

# Seed
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed 2>/dev/null", timeout=15)

# Save PM2
run("pm2 save 2>&1")

print("=== DONE ===")
client.close()
