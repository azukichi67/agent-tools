set dotenv-load
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

port := env_var_or_default("SSH_PORT", "2222")
forward_ports := env_var_or_default("FORWARD_PORTS", "3000 3001 8000 5555")

default:
    @just --list

# ビルドして起動する
up:
    docker compose up -d --build

# 停止する（volume は残る）
down:
    docker compose down

# 再起動する
restart:
    docker compose restart

# SSH で入る
shell:
    ssh -p {{port}} dev@localhost

# コンテナ内のポートを手元の同じ番号に転送する。Ctrl+C で止める
forward:
    ssh -p {{port}} -N -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 {{replace_regex(forward_ports, '(\d+)', '-L ${1}:localhost:${1}')}} dev@localhost

# ログを追う
logs:
    docker compose logs -f

# 状態を確認する
status:
    docker compose ps

# 停止して volume も消す。home（gh・claude の認証）と workspace（リポジトリ）も消える
destroy:
    docker compose down -v
