FROM kalilinux/kali-rolling:latest

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    wget \
    git \
    sudo \
    vim \
    net-tools \
    dnsutils \
    python3 \
    python3-pip \
    ruby-full \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libcurl4-openssl-dev \
    libffi-dev \
    libssl-dev \
    nmap \
    masscan \
    sqlmap \
    amass \
    theharvester \
    nikto \
    dirb \
    gobuster \
    wfuzz \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Python and Ruby-based tools
RUN pip3 install --no-cache-dir sublist3r
RUN gem install wpscan --no-document || true

# Create a non-root user for interactive use
ARG USER=recon
ARG UID=1000
RUN useradd -m -u ${UID} -s /bin/bash ${USER} \
    && echo "${USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USER} \
    && chmod 0440 /etc/sudoers.d/${USER}

WORKDIR /home/recon

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/home/recon/data"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
