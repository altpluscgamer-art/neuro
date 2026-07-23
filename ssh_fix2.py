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

# Clean install
print("=== CLEAN INSTALL ===")
run("cd /opt/neuro && rm -rf node_modules package-lock.json && npm install --production=false 2>&1 | tail -20", timeout=600)

# Check next binary
print("=== CHECK ===")
run("ls -la /opt/neuro/node_modules/.bin/next 2>/dev/null || echo 'NO NEXT BINARY'")

# Build
print("=== BUILD ===")
run("cd /opt/neuro && node node_modules/.bin/next build 2>&1 | tail -20", timeout=600)

# Check .next
print("=== BUILD OUTPUT ===")
run("ls /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD OK' || echo 'NO BUILD'")

# Stop old PM2
print("=== PM2 RESTART ===")
run("pm2 delete neuro 2>/dev/null; true")

# Start with node directly
run("cd /opt/neuro && pm2 start 'node node_modules/.bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(8)

# Logs
print("=== PM2 LOGS ===")
run("pm2 logs neuro --lines 15 --nostream", timeout=15)

# Test
print("=== TEST LOCAL ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null || echo 'FAIL'")

# Nginx
print("=== NGINX ===")
run("systemctl start nginx 2>&1; systemctl enable nginx 2>&1")
run("systemctl status nginx --no-pager 2>&1 | head -5")
run("nginx -t 2>&1")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null || echo 'FAIL'")

# Seed
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed 2>/dev/null | head -5", timeout=15)

print("=== DONE ===")
client.close()
