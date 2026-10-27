---
name: implement-plan
description: docs/design-for-ai/ の実装計画どおりに実装し、実装後に自分でレビューと改善を3回繰り返し、PRを作成してレビューループを回す。計画を作ったセッションとは別の、新しいセッションで使う。
argument-hint: "<実装計画ファイル>"
disable-model-invocation: true
---

# 実装計画どおりに実装する

計画を作ったセッションの文脈を持ち込まないよう、新しいセッションで実行する。このセッションで計画を作成・レビューしていた場合は、ユーザーに新しいセッションで実行し直すよう伝えて終了する。

## 手順

1. $ARGUMENTS から実装計画ファイルのパスを取得する。無ければユーザーに確認する。
2. 実装計画を最後まで読む。
3. 実装計画のとおりに実装する。実装計画と実際のコードが矛盾している場合や、実装計画に書かれていない判断が必要になった場合は、推測で進めずユーザーに確認する。テストを書く際は、先に `test-layering` Skill（`.claude/skills/test-layering/SKILL.md`）と `unit-test-plan` Skill（`.claude/skills/unit-test-plan/SKILL.md`）を読み込み、その内容に従う。E2E テストを書く際は、`e2e-test-plan` Skill（`.claude/skills/e2e-test-plan/SKILL.md`）も読み込み、その内容に従う。
4. 実装計画に書かれた品質管理の手順（テスト・lint・型チェック等）を実行し、通ることを確認する。
5. 実装について、自分でレビューと改善を3回繰り返す。各回で、実装計画との差異と、品質管理の手順が通ることを確認する。
6. main にいる場合は、作業ブランチ `<種別>/<Issue番号>-<内容の英語要約>`（例: `feat/14-create-place`）を切る。Issue番号は実装計画のファイル名（`issue<番号>-`）から取り、種別は Issue の label から決める（`feature` → `feat`、`bug` → `fix`、`chore` → `chore`）。
7. Skill tool で `create-commit` を呼び出し、変更をコミットする。
8. Skill tool で `create-pr` を呼び出し、PR を作成する。
9. `git rev-parse HEAD` でループ開始時のコミットを控えてから、Skill tool で `pr-review-loop` を呼び出し、args に PR の URL を渡してレビューループを回す。
10. `git rev-parse HEAD` が手順9で控えたコミットから変わっていれば（レビューでコードが変わった）、PR の本文と撮影を作り直す。変わっていなければ、この手順は飛ばす。
   - 未 push のコミットが残っている場合は、先に push してよいかをユーザーに確認する。承認されたら Skill tool で `create-pr` を呼び出し、本文と撮影を最新の差分に合わせて作り直す（`create-pr` が push する）。拒否されたら作り直さず、PR の本文が差分と食い違っている可能性があることを報告に含める。
   - 未 push のコミットが無い（ループ中に push 済み）場合は、確認せずに Skill tool で `create-pr` を呼び出して作り直す。
11. レビューループの結果を報告し、次の工程を案内する。
   - 人間が最終確認（未実施の確認を含む）をしてマージする
