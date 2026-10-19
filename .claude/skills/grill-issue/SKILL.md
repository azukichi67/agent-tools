---
name: grill-issue
description: GitHub Issueに着手する際、grillingとdomain-modelingスキルでユーザーをグリルし、事情を知らないAIエージェントが詳細な実装計画を作れるだけの情報をIssueの説明欄に書き足す。
argument-hint: "<Issue番号>"
disable-model-invocation: true
---

# Issueをグリルして説明欄を仕上げる

## 手順

1. $ARGUMENTS からIssue番号を取得する。無ければユーザーに確認する。
2. `gh issue view <番号>` で現在のIssue本文を確認する。`docs/requirements/issue<番号>-*/requirements.md` があれば読み、合意済みの要件として扱う。説明欄にはその文書へのリンクを書く。
3. Skill tool で `mattpocock-skills:grilling` と `mattpocock-skills:domain-modeling` を呼び出す。`mattpocock-skills:grill-with-docs` は `disable-model-invocation: true` のため Skill tool から呼べない。中身はこの2つを呼ぶだけなので、直接呼ぶ。`grilling` の args には以下を渡す。

   ```
   #<番号> を着手する
   ゴールはこのIssueの説明欄に事情を知らないAIエージェントが詳細な実装計画を作れるだけの情報を記載する事です。
   ```

4. グリルのフロンティアが空になり、ユーザーと共通理解に達したら、`gh issue edit <番号> --body <本文>` で説明欄を更新する。既存の本文は消さず、グリルで得られた情報を追記・整理する形で反映する。
