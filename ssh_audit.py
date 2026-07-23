import paramiko
import sys

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

commands = [
    "echo '=== OS ==='",
    "cat /etc/os-release | head -5",
    "echo '=== PORTS ==='",
    "ss -tlnp | head -30",
    "echo '=== NGINX ==='",
    "which nginx 2>/dev/null && nginx -t 2>&1 || echo 'nginx not installed'",
    "ls /etc/nginx/sites-enabled/ 2>/dev/null || echo 'no nginx sites'",
    "echo '=== XRAY/V2RAY ==='",
    "which xray v2ray 2>/dev/null || echo 'not found'",
    "systemctl list-units --type=service --state=running | grep -iE 'xray|v2ray|vpn|sing|clash|nginx|caddy|hysteria' 2>/dev/null || echo 'none found'",
    "echo '=== CONFIGS ==='",
    "ls /usr/local/etc/xray/ 2>/dev/null || ls /etc/xray/ 2>/dev/null || echo 'no xray config dir'",
    "ls /etc/v2ray/ 2>/dev/null || echo 'no v2ray config'",
    "echo '=== NODE ==='",
    "which node 2>/dev/null && node --version || echo 'node not installed'",
    "echo '=== PM2 ==='",
    "which pm2 2>/dev/null && pm2 list || echo 'pm2 not installed'",
    "echo '=== DNS ==='",
    "cat /etc/hosts | grep mybestsite || echo 'no mybestsite in hosts'",
    "echo '=== CERTBOT ==='",
    "which certbot 2>/dev/null || echo 'certbot not installed'",
    "ls /etc/letsencrypt/live/ 2>/dev/null || echo 'no certs'",
    "echo '=== FIREWALL ==='",
    "ufw status 2>/dev/null || iptables -L -n 2>/dev/null | head -20 || echo 'no firewall info'",
    "echo '=== DISK ==='",
    "df -h / | tail -1",
    "echo '=== DONE ==='",
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password, timeout=10)
    print("Connected!\n")
    
    for cmd in commands:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if out:
            print(out)
        if err and 'warning' not in err.lower():
            print(f"  ERR: {err}")
    
    client.close()
    print("\nDone.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
