import paramiko

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

commands = [
    "echo '=== NGINX CONFIG ==='",
    "cat /etc/nginx/sites-enabled/govless 2>/dev/null || echo 'not found'",
    "echo '=== NGINX FULL ==='",
    "cat /etc/nginx/nginx.conf",
    "echo '=== XRAY PROCESS ==='",
    "ps aux | grep xray | grep -v grep",
    "echo '=== X-UI ==='",
    "ps aux | grep x-ui | grep -v grep",
    "echo '=== XRAY CONFIG ==='",
    "find / -name 'config.json' -path '*xray*' 2>/dev/null | head -5",
    "cat /usr/local/x-ui/bin/config.json 2>/dev/null | head -50 || echo 'no x-ui config'",
    "echo '=== SSL CERT ==='",
    "ls -la /etc/letsencrypt/live/mybestsite.com.ng/",
    "echo '=== CRONTAB ==='",
    "crontab -l 2>/dev/null || echo 'no crontab'",
    "echo '=== NGINX SITES ==='",
    "ls -la /etc/nginx/sites-enabled/",
    "echo '=== NGINX PORTS ==='",
    "ss -tlnp | grep nginx",
    "echo '=== DONE ==='",
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=10)

for cmd in commands:
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)
    if err and 'warning' not in err.lower():
        print(f"  ERR: {err}")

client.close()
