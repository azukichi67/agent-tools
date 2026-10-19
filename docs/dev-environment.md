# 開発コンテナ

VS Code の devcontainer は使わない。sshd を常駐させたコンテナに Orca から SSH で入り、コンテナ内で worktree を作ってエージェントを動かす。

1 プロジェクト 1 コンテナにはしない。顧客・権限などの範囲ごとに長く使うコンテナを 1 つ立て、その範囲のリポジトリはすべて `/workspace` に置く。

## 構成

| ファイル | 役割 |
|---|---|
| `compose.yml` | コンテナと volume の定義 |
| `docker/Dockerfile` | git, gh, ripgrep, fzf, Claude Code, sshd, mise（Node・pnpm）, Playwright の OS 依存を入れた汎用ベース |
| `docker/sshd_config` | 公開鍵認証のみ。ポートフォワードと SFTP は有効。非対話セッションの PATH も決める |
| `docker/mise-config.toml` | mise のシステム設定。`.node-version` / `.nvmrc` を読ませる |
| `docker/dev-path.sh` | ログインシェルの PATH に mise と claude を足す |
| `docker/entrypoint.sh` | ホストキー生成、公開鍵を `authorized_keys` にコピー、sshd 起動 |
| `justfile` | 起動・接続などのタスク |
| `.env.example` | `.env` の雛形 |

volume は次の 3 つ。`COMPOSE_PROJECT_NAME` が接頭辞になるため、範囲ごとに分かれる。

| volume | マウント先 | 中身 |
|---|---|---|
| `home` | `/home/dev` | gh・Claude Code・git の認証と設定 |
| `workspace` | `/workspace` | リポジトリと worktree |
| `ssh-host-keys` | `/etc/ssh/host-keys` | sshd のホストキー |

リポジトリをホストからの bind mount にせず volume に置いているのは、Windows の bind mount は I/O が遅く、パーミッションも崩れやすいため。

## 前提

- Docker Desktop
- just（`winget install Casey.Just`）
- ホストの SSH 鍵（無ければ `ssh-keygen -t ed25519`）

## セットアップ

メインのチェックアウト（worktree ではない方）で行う。worktree から起動すると、worktree を消したときにスキルとルールのマウント元が消える。

```sh
cp .env.example .env
just up
just shell
```

公開鍵は `~/.ssh/id_ed25519.pub` をマウントする。別の鍵を使うときは `.env` の `SSH_PUBLIC_KEY_PATH` で指定する。

## Orca への登録

Settings → SSH → Add Target に次を入力し、Test で疎通を確認してから Save する。

| 項目 | 値 |
|---|---|
| Host | `localhost` |
| Port | `.env` の `SSH_PORT` |
| User | `dev` |
| Identity file | `~/.ssh/id_ed25519` |

## コンテナ内の初回作業

```sh
gh auth login
gh auth setup-git
git config --global user.name "..."
git config --global user.email "..."
claude          # ログイン
cd /workspace && git clone ...
```

認証と設定は `home` volume に残るため、`just down` / `just up` を挟んでもやり直す必要はない。

## Node と pnpm

| | 決まり方 |
|---|---|
| Node | mise がプロジェクトの `.node-version` / `.nvmrc` を読んで切り替える。未インストールの版は初回実行時に自動で入る。指定が無ければ Node 24 |
| pnpm | mise で入れた pnpm が、package.json の `packageManager` の版を自分でダウンロードして使う |
| pnpm の store | `/workspace/.pnpm-store`。home とは別の volume なので、ハードリンクが効くよう pnpm が `/workspace` 側に作る |
| Playwright のブラウザ | プロジェクトごとに `pnpm exec playwright install chromium` で `~/.cache/ms-playwright` に入れる |

Playwright が要求する OS のライブラリと日本語フォントはイメージに入っている。依存の一覧は Playwright の版ごとに違うので、プロジェクトの `@playwright/test` を上げたら `docker/Dockerfile` の `PLAYWRIGHT_VERSION` も合わせて `just up` する。

## スキルとルール

このリポジトリの汎用スキルとルールを、コンテナ内のどのプロジェクトでも使えるようにしている。

| ホスト側 | コンテナ内 | Claude Code での扱い |
|---|---|---|
| `.claude/skills` | `~/.claude/skills` | personal スキル |
| `.claude/rules` | `~/.claude/rules` | user ルール |

- 読み取り専用でマウントしている。編集はホスト側のこのリポジトリで行い、すぐ反映される
- プロジェクト側に同名のスキルがあると、こちらの personal スキルが優先される
- リポジトリ固有の指示は `CLAUDE.md` に、汎用の指示は `.claude/rules/` に書く

## 範囲を増やす

この一式（`compose.yml`・`docker/`・`justfile`・`.env.example`）を別ディレクトリにコピーし、`.env` の `COMPOSE_PROJECT_NAME` と `SSH_PORT` を変える。`AGENT_TOOLS_DIR` には、このリポジトリの絶対パスを書く。

Node 以外の言語ランタイムは、まず mise で入れられるか検討する（`mise use <tool>`）。apt でしか入らないものは `docker/Dockerfile` に追記する。`home` volume は初回作成時にしかイメージの中身を取り込まないため、home 配下に入れるツールは Dockerfile ではなくコンテナ内でインストールする。

## 注意

- `just destroy` は volume も消す。認証情報もリポジトリも失われる。
- キャッシュや古いイメージが溜まるので、`docker system df` で容量を確認し、`docker system prune` で掃除する。
