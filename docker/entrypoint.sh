#!/bin/bash
set -euo pipefail

# Docker Desktop は bind mount のパスが存在しないとホスト側に空ディレクトリを作って起動してしまう
if [ ! -f /etc/ssh/host-public-key ]; then
  echo "公開鍵ファイルが見つからない。.env の SSH_PUBLIC_KEY_PATH を確認し、ホスト側に作られた空ディレクトリを消すこと" >&2
  exit 1
fi

host_key=/etc/ssh/host-keys/ssh_host_ed25519_key
if [ ! -f "$host_key" ]; then
  ssh-keygen -q -t ed25519 -f "$host_key" -N ""
fi

# Windows からの bind mount は所有者とパーミッションが崩れて StrictModes に弾かれるため、
# 直接 authorized_keys にせずコピーする。ホスト側の鍵を正とし、起動のたびに上書きする
install -d -m 700 -o dev -g dev /home/dev/.ssh
install -m 600 -o dev -g dev /etc/ssh/host-public-key /home/dev/.ssh/authorized_keys

# 配下に skills と rules をマウントするため Docker が root 所有で作る。
# dev 所有にしないと Claude Code が認証情報を書けない
chown dev:dev /home/dev/.claude

mkdir -p /run/sshd
exec /usr/sbin/sshd -D -e
