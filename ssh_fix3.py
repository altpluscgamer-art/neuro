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
        sys.stdout.buffer.write(out.encode('utf-8')[:8000])
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()
    return out

# Check disk
print("=== DISK ===")
run("df -h")
run("df -h /run")

# Clean up
print("=== CLEANUP ===")
run("apt-get clean")
run("rm -rf /var/cache/apt/archives/*")
run("rm -rf /opt/neuro/node_modules /opt/neuro/.next /opt/neuro/package-lock.json")
run("rm -rf /tmp/* 2>/dev/null; true")
run("rm -rf /root/.npm/_cacache 2>/dev/null; true")
run("pm2 delete neuro 2>/dev/null; true")
run("journalctl --vacuum-size=10M 2>/dev/null; true")

# Check disk after cleanup
print("=== DISK AFTER ===")
run("df -h /")

# Reinstall — use npm ci for clean install
print("=== NPM INSTALL ===")
run("cd /opt/neuro && npm install --no-optional 2>&1 | tail -10", timeout=600)

# Check
print("=== CHECK ===")
run("ls -la /opt/neuro/node_modules/next/dist/bin/next 2>/dev/null && echo 'NEXT FOUND' || echo 'NO NEXT'")
run("ls /opt/neuro/node_modules/.bin/next 2>/dev/null && echo 'BINARY OK' || echo 'NO BINARY'")

# Generate prisma
print("=== PRISMA ===")
run("cd /opt/neuro && npx prisma generate 2>&1 | tail -5", timeout=120)
run("cd /opt/neuro && npx prisma migrate deploy 2>&1 | tail -5", timeout=60)

# Build
print("=== BUILD ===")
run("cd /opt/neuro && node node_modules/next/dist/bin/next build 2>&1 | tail -20", timeout=600)

# Check build
print("=== BUILD CHECK ===")
run("ls /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD OK' || echo 'NO BUILD'")

# Start PM2
print("=== START ===")
run("cd /opt/neuro && pm2 start 'node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(8)
run("pm2 logs neuro --lines 5 --nostream", timeout=15)

# Test
print("=== TEST ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null")

# Nginx
print("=== NGINX ===")
run("rm -rf /run/systemd/system/nginx.* 2>/dev/null; systemctl daemon-reload 2>/dev/null; true")
run("systemctl restart nginx 2>&1 || nginx 2>&1")
time.sleep(2)
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null")

# Seed
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed 2>/dev/null", timeout=15)

print("=== DONE ===")
client.close()
