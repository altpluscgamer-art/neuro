import paramiko
import sys
import time

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=10)

def run(cmd, timeout=120):
    sys.stdout.buffer.write(f">>> {cmd}\n".encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        sys.stdout.buffer.write(out.encode('utf-8')[:5000])
        sys.stdout.buffer.write(b'\n')
    if err:
        sys.stdout.buffer.write(b'  E: ')
        sys.stdout.buffer.write(err.encode('utf-8')[:2000])
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()
    return out

# Check PM2 logs
print("=== PM2 LOGS ===")
run("pm2 logs neuro --lines 30 --nostream")

# Check if .next exists (build output)
print("=== BUILD CHECK ===")
run("ls -la /opt/neuro/.next/ 2>/dev/null | head -10 || echo 'no .next dir'")
run("ls /opt/neuro/node_modules/.bin/next 2>/dev/null || echo 'no next binary'")

# Check npm install completion
print("=== NPM CHECK ===")
run("cd /opt/neuro && npm ls next 2>/dev/null | head -5")

# Try npm install + build again
print("=== REINSTALL ===")
run("cd /opt/neuro && npm install", timeout=180)
run("cd /opt/neuro && npx next build", timeout=300)

# Check build output
print("=== BUILD RESULT ===")
run("ls -la /opt/neuro/.next/ 2>/dev/null | head -10")

# Restart PM2 properly
print("=== RESTART PM2 ===")
run("pm2 delete neuro 2>/dev/null; true")
# Use node directly instead of npx
run("cd /opt/neuro && pm2 start 'node node_modules/.bin/next start --hostname 0.0.0.0 -p 3000' --name neuro --cwd /opt/neuro", timeout=30)
time.sleep(5)
run("pm2 logs neuro --lines 10 --nostream")

# Test
print("=== TEST ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")

# Start Nginx
print("=== NGINX ===")
run("systemctl start nginx")
run("systemctl status nginx --no-pager | head -5")
run("systemctl enable nginx")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/")

# Seed
print("=== SEED ===")
run("curl -s -X POST http://127.0.0.1:3000/api/admin/seed", timeout=15)

print("=== DONE ===")
client.close()
