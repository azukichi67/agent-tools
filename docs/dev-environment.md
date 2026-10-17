# 開発コンテナ（devcontainer脱却版）

VSCode の devcontainer は使わない。Docker Compose + SSH で立てたコンテナに、
手元のエディタ・ターミナル（orca等）から直接つなぐ。

## 構成

- `docker/Dockerfile` — git, gh, ripgrep, fzf, Claude Code CLI, sshd を入れた汎用ベース
- `docker-compose.yml` — コンテナ定義。カレントディレクトリを `/workspace` にマウントする
- `justfile` — 起動・接続などのタスク
- `.env.example` — `.env` にコピーして使う設定

## 前提

- Docker Desktop
- `just`（`winget install Casey.Just` または `choco install just`）
- SSH鍵（無ければ `ssh-keygen -t ed25519`）

## 使い方

```sh
cp .env.example .env
# .env の SSH_PUBLIC_KEY_PATH を自分の公開鍵の絶対パスに書き換える

just build
just up
just shell     # SSH接続
just down      # 停止
just destroy   # 停止 + volume削除（home配下の状態も消える）
```

`PROJECT_NAME` と `SSH_PORT` は複数プロジェクトを同時に起動するときにぶつからないよう `.env` で変える。

## 他プロジェクトへの持ち出し方

このリポジトリは基盤テンプレートなので、新しいアプリ開発プロジェクトを始めるときは
`docker/`・`docker-compose.yml`・`justfile`・`.env.example` をそのプロジェクトにコピーする。
そのプロジェクトの言語・パッケージマネージャ（Node/pnpm など）は `docker/Dockerfile` に追記する。
