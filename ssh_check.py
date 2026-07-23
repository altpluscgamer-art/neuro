import paramiko
import sys

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=30)

def run(cmd, timeout=120):
    sys.stdout.buffer.write(f">>> {cmd}\n".encode('utf-8'))
    sys.stdout.buffer.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        sys.stdout.buffer.write(out.encode('utf-8')[:6000])
        sys.stdout.buffer.write(b'\n')
    sys.stdout.buffer.flush()
    return out

# Check current state
print("=== BUILD STATUS ===")
run("ls /opt/neuro/.next/BUILD_ID 2>/dev/null && echo 'BUILD EXISTS' || echo 'NO BUILD YET'")

print("=== PM2 ===")
run("pm2 list 2>/dev/null || echo 'PM2 empty'")

print("=== PORT 3000 ===")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>/dev/null || echo 'NOT LISTENING'")

print("=== NGINX ===")
run("systemctl status nginx --no-pager 2>&1 | head -5")
run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:80/ 2>/dev/null || echo 'NOT LISTENING'")

print("=== DISK ===")
run("df -h / /run")

print("=== SWAP ===")
run("free -h")

client.close()
