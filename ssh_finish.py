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
        for line in out.split('\n')[-25:]:
            sys.stdout.buffer.write(line.encode('utf-8') + b'\n')
    sys.stdout.buffer.flush()
    return out

# Build (the missing step)
print("=== BUILD ===")
run("cd /opt/neuro && node node_modules/next/dist/bin/next build 2>&1 | tail -25", timeout=600)

print("=== BUILD CHECK ===")
run("cat /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD OK' || echo 'NO BUILD'")

# Start PM2
print("=== START PM2 ===")
run("pm2 delete neuro 2>/dev/null; true")
run("cd /opt/neuro && pm2 start 'node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(8)
run("pm2 logs neuro --lines 5 --nostream", timeout=15)

# Test port 3000
print("=== TEST 3000 ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null")

# Fix /run — kill processes writing to it, clean up
print("=== FIX /run ===")
run("rm -rf /run/systemd/system/nginx.service.d 2>/dev/null; true")
run("rm -rf /run/user/0/pm2* 2>/dev/null; true")
run("df -h /run")

# Start Nginx
print("=== NGINX ===")
run("systemctl daemon-reload 2>&1; true")
run("systemctl restart nginx 2>&1 || { nginx -t && nginx; }", timeout=15)
time.sleep(2)
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null")

# Seed database
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed 2>/dev/null", timeout=15)

# Final test through Nginx
print("=== FINAL TEST ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/screening 2>/dev/null")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/telegram-app 2>/dev/null")

# PM2 save
run("pm2 save 2>&1")

# Status
print("=== STATUS ===")
run("pm2 list")
run("free -h")
run("df -h /")

print("=== DONE ===")
client.close()
