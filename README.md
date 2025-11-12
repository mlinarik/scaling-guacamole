# Kali Recon Container (for authorized bug bounty recon)

This repository contains a small Docker-based Kali Linux toolkit image pre-installed with common recon tools used during authorized bug bounty testing and reconnaissance.

WARNING: Only use these tools against targets you are explicitly authorized to test. Unauthorized scanning or exploitation is illegal and unethical.

Included (representative):

- nmap, masscan
- sqlmap
- amass
- theHarvester
- nikto
- dirb
- gobuster
- wfuzz
- sublist3r (pip)
- wpscan (gem)

Files added:

- `Dockerfile` — builds a Kali-based image with common recon tools and creates a `recon` non-root user.
- `entrypoint.sh` — entrypoint that runs commands as the `recon` user or opens a shell.
- `docker-compose.yml` — convenience compose file to build/run the container and mount `./data`.
- `.dockerignore` — keeps build context small.

Quick start

1) Build with docker-compose (recommended):

```bash
docker compose up --build -d
docker compose exec recon bash
```

Or build/run directly with Docker:

```bash
docker build -t kali-recon:latest .
docker run --rm -it -v "$(pwd)/data:/home/recon/data" kali-recon:latest
```

Examples

- Passive subdomain enumeration (amass):
  - amass enum -d example.com -o /home/recon/data/amass.txt
- Bruteforce web directories (gobuster):
  - gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt -o /home/recon/data/gobuster.txt
- Quick port scan (nmap):
  - nmap -sC -sV -Pn example.com -oN /home/recon/data/nmap.txt

Notes & next steps

- This image is intentionally minimal and focuses on commonly used recon utilities available via apt/pip/gem in Kali. If you want Go-based tools (subfinder, amass latest builds, findomain, httprobe from github releases, etc.), we can extend the Dockerfile to install Go and fetch specific releases.
- If you'd like a GUI browser (Chromium) or a web UI for results, I can add that next.

Legal

Only run scans and reconnaissance against systems you own or have explicit permission to test (e.g., in-scope targets on a bug bounty program). Keep logs of authorization.
