import paramiko
import sys
import time
import os

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'
local_zip = r"C:\script\NEURO\neuro-deploy.zip"

# Step 1: Upload zip via SFTP
print("=== UPLOADING ===")
transport = paramiko.Transport((host, 22))
transport.connect(username=user, password=password)
sftp = paramiko.SFTPClient.from_transport(transport)

remote_zip = "/tmp/neuro-deploy.zip"
print(f"Uploading {os.path.getsize(local_zip)} bytes...")
sftp.put(local_zip, remote_zip)
print("Upload complete!")
sftp.close()
transport.close()

# Step 2: Deploy on server
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=30)

def run(cmd, timeout=300):
    sys.stdout.buffer.write(f">>> {cmd}\n".encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        sys.stdout.buffer.write(out.encode('utf-8')[:6000])
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()
    return out

# Clean up and extract
print("=== CLEAN OLD ===")
run("pm2 delete neuro 2>/dev/null; true")
run("rm -rf /opt/neuro")
run("mkdir -p /opt/neuro")

print("=== EXTRACT ===")
run("cd /opt/neuro && unzip -o /tmp/neuro-deploy.zip 2>&1 | tail -5", timeout=60)
run("ls /opt/neuro/")

# Install only production deps (skip devDependencies to save RAM)
print("=== INSTALL PROD DEPS ===")
run("cd /opt/neuro && npm install --omit=dev 2>&1 | tail -10", timeout=600)

# Check next binary
print("=== CHECK ===")
run("ls /opt/neuro/node_modules/next/dist/bin/next 2>/dev/null && echo 'NEXT OK' || echo 'NO NEXT'")

# Fix .env for production
print("=== ENV ===")
run("""cd /opt/neuro && cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://mybestsite.com.ng"
EOF
""")
run("cd /opt/neuro && SECRET=$(openssl rand -base64 32) && sed -i \"s|\\\"\\$(openssl rand -base64 32)\\\"|\\\"$SECRET\\\"|\" .env && cat .env")

# Prisma
print("=== PRISMA ===")
run("cd /opt/neuro && npx prisma generate 2>&1 | tail -3", timeout=120)
run("cd /opt/neuro && npx prisma migrate deploy 2>&1 | tail -5", timeout=60)

# Check .next BUILD_ID
print("=== BUILD CHECK ===")
run("cat /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD OK' || echo 'NO BUILD'")

# Start PM2
print("=== START PM2 ===")
run("cd /opt/neuro && pm2 start 'node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(8)
run("pm2 logs neuro --lines 5 --nostream", timeout=15)

# Test local
print("=== TEST ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/screening 2>/dev/null")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/telegram-app 2>/dev/null")

# Nginx
print("=== NGINX ===")
run("systemctl start nginx 2>&1 || nginx 2>&1")
time.sleep(2)
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null")

# Seed
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed 2>/dev/null", timeout=15)

# Save PM2
run("pm2 save")

# Cleanup
run("rm -f /tmp/neuro-deploy.zip")

print("=== DONE ===")
client.close()
