# agent-tools

アプリに依存しない AI エージェント（Claude Code）用の道具と、それを使う開発コンテナを置くリポジトリ。

| 置いているもの | 場所 |
|---|---|
| 汎用スキル | `.claude/skills/` |
| 汎用ルール（行動原則・返答ルール） | `.claude/rules/` |
| Orca から SSH で入る開発コンテナ | `compose.yml`, `docker/`, `justfile` |

## 開発コンテナ

devcontainer は使わない。範囲（顧客・権限など）ごとに長く使うコンテナを 1 台立て、Orca から SSH で入り、コンテナ内で worktree を作ってエージェントを動かす。Node（mise）、pnpm、Playwright の OS 依存は入っている。

```sh
cp .env.example .env
just up
just shell
```

起動はメインのチェックアウトで行う。Orca への登録、初回のログイン、範囲を増やす方法は [docs/dev-environment.md](docs/dev-environment.md) を参照。

## スキルとルール

開発コンテナは `.claude/skills` と `.claude/rules` を `~/.claude/` 配下に読み取り専用でマウントする。コンテナ内のどのプロジェクトでも、スキルは personal スキル、ルールは user ルールとして読み込まれる。編集はこのリポジトリで行う。

- リポジトリ固有の指示は `CLAUDE.md` に書く
- どのプロジェクトにも効かせたい指示は `.claude/rules/` に書く

### スキルを使う場面

各スキルの説明は、それぞれの `SKILL.md` に書いてある。

Issue から PR までの流れ:

1. `requirements-definition`: 要件を決める
2. `grill-issue`: Issue に実装計画の材料を書き足す
3. `plan-issue`: 実装計画を作る（`plan-review-loop` と `explain-visually` を使う）
4. `implement-plan`: 計画どおりに実装し、PR を作る（`create-commit`・`create-pr`・`pr-review-loop` を使う）

実装中や計画中に参照するもの:

- 設計: `code-design`, `code-naming`
- 情報の置き場所（コード・テスト・コミットログ・コメント）: `code-comments`
- テスト: `test-layering`, `unit-test-plan`, `e2e-test-plan`

単独で使うもの:

- `explain-visually`: 長い文書や PR を、図付きの解説 HTML にする
- DB 定義の理解（入力は tbls の出力）:
  - `create-er`: ドメインごとにまとめたインタラクティブな ER 図の HTML を作る
  - `explain-table`: 1テーブルの役割とデータの動きを、アプリのソースを根拠に解説する HTML を作る
  - `explain-db`: 上の2つを使い、DB 全体の解説資料一式（索引・ER 図・テーブルごとのページ）を作る
- `create-skill`: スキルを作る・見直す
- `create-commit`, `create-pr`, `pr-review-loop`, `plan-review-loop`: 上の流れの外でも使える
