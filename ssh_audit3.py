import paramiko

host = "138.226.220.143"
user = "root"
password = r'V\T%}+bRE4CF\$V$'

commands = [
    "echo '=== XRAY FULL CONFIG ==='",
    "cat /usr/local/x-ui/bin/config.json 2>/dev/null | python3 -m json.tool 2>/dev/null | head -120 || cat /usr/local/x-ui/bin/config.json 2>/dev/null | head -120",
    "echo '=== XRAY FALLBACK ==='",
    "cat /usr/local/x-ui/bin/config.json 2>/dev/null | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(json.dumps(i,indent=2)) for i in d.get('inbounds',[]) if i.get('port')==443]\" 2>/dev/null",
    "echo '=== NGINX HTML ==='",
    "ls /var/www/html/ 2>/dev/null",
    "cat /var/www/html/index.html 2>/dev/null | head -20",
    "echo '=== CERTBOT RENEW ==='",
    "cat /etc/letsencrypt/renewal/mybestsite.com.ng.conf 2>/dev/null | head -20",
    "echo '=== ACME ==='",
    "ls /root/.acme.sh/ 2>/dev/null | head -10",
    "/root/.acme.sh/acme.sh --list 2>/dev/null | head -10",
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
