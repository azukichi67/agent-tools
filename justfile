# sh が無い Windows でも動くようPowerShellでレシピを実行する
set windows-powershell := true

ssh_port := env_var_or_default("SSH_PORT", "2222")

default:
    @just --list

# イメージをビルドする
build:
    docker compose build

# コンテナを起動する
up:
    docker compose up -d
    @echo "起動しました。'just shell' で接続できます（port {{ssh_port}}）"

# コンテナを停止する
down:
    docker compose down

# コンテナを再起動する
restart:
    docker compose restart

# SSH でコンテナに入る
shell:
    ssh -p {{ssh_port}} -o StrictHostKeyChecking=accept-new dev@localhost

# ログを追う
logs:
    docker compose logs -f

# 状態を確認する
status:
    docker compose ps

# コンテナとvolumeを消す（home配下の状態も消える）
destroy:
    docker compose down -v
