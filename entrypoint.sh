#!/usr/bin/env bash
set -euo pipefail

# Simple entrypoint: run passed command as user 'recon' (if given), otherwise drop to an interactive shell
if [ "$#" -gt 0 ]; then
  # If running as root in container, switch to 'recon' for safety when interactive
  if [ "$(id -u)" -eq 0 ]; then
    exec su - recon -c "$*"
  else
    exec "$@"
  fi
else
  # Start an interactive bash as the recon user
  if [ "$(id -u)" -eq 0 ]; then
    exec su - recon -c "bash"
  else
    exec bash
  fi
fi
