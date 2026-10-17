#!/bin/bash
set -euo pipefail

mkdir -p /run/sshd

# ホストキーを /home/dev 配下（named volume）に置き、コンテナを作り直しても
# 同じ鍵を使い続けることで、クライアント側の known_hosts 警告を避ける。
mkdir -p /home/dev/.ssh-host-keys
chown -R dev:dev /home/dev/.ssh-host-keys

for type in rsa ed25519; do
  key="/home/dev/.ssh-host-keys/ssh_host_${type}_key"
  if [ ! -f "$key" ]; then
    ssh-keygen -q -t "$type" -f "$key" -N ""
  fi
done

exec /usr/sbin/sshd -D -e \
  -o "HostKey=/home/dev/.ssh-host-keys/ssh_host_rsa_key" \
  -o "HostKey=/home/dev/.ssh-host-keys/ssh_host_ed25519_key"
