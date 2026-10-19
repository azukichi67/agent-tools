---
name: create-pr
description: コミット済みのブランチから PR を作る。画面が変わる変更なら撮影し、.github/pull_request_template.md の構成で本文を書く。ブランチに open な PR が既にあれば、最新の差分に合わせて本文と撮影を作り直す。implement-plan から呼ばれるほか、単独でも使える。
---

# コミット済みのブランチから PR を作る

ブランチの作成とコミットは扱わない。コマンドは全てリポジトリ直下（`git rev-parse --show-toplevel`）で実行する。撮影の出力パスと、`gh --attach` が本文中の参照を照合するパスが、どちらも cwd 基準のため。

## モード

`gh pr view --json number,state,body` で、現在のブランチの PR を調べる。

- PR が無い（コマンドが失敗する）: **新規作成**
- `state` が `OPEN`: **作り直し**。既存の PR に対して、最新の差分に合わせて本文と撮影を作り直す。タイトルは変えない
- それ以外（`MERGED`・`CLOSED`）: 何もせず、ユーザーに状況を伝えて確認する

## 手順

### 1. 前提を確かめる

- 現在のブランチが `main` なら、終了してブランチを切るよう伝える。
- `git status --porcelain` が空でなければ、コミットされていない変更の扱いをユーザーに確認する（コミットはこのスキルの範囲外）。
- `git fetch origin` のあと、`git log --oneline origin/main..HEAD` が空なら、PR にするコミットが無いと伝えて終了する。

### 2. Issue 番号と先頭行を決める

- 作り直し: 既存の PR 本文の先頭行が `Closes #N` か `Refs #N` なら、それを引き継ぐ。どちらでもなければ（Issue の無い PR）先頭行を書かない。Issue 番号は `N` を使う。
- 新規作成:
  - ブランチ名 `<種別>/<番号>-…`（正規表現 `^[a-z]+/([0-9]+)-`）から Issue 番号を取る。取れなければ、Issue 番号か「Issue なし」かをユーザーに確認する。
  - Issue なし: 先頭行を書かない。
  - `ls docs/design-for-ai/issue<番号>-pr[0-9]*-* 2>/dev/null` に該当があれば、その Issue は複数の PR に分けている。この PR が最後の PR かをユーザーに確認し、最後なら `Closes #<番号>`、途中なら `Refs #<番号>` にする。
  - 該当が無ければ `Closes #<番号>`。

### 3. push する

`git push -u origin HEAD`

### 4. 撮影する

新規作成では、撮影するかどうかに関係なく、最初に `rm -rf .pr-media/scenarios` で前の PR のシナリオを消す。`.pr-media/` は git に追跡されないため、ブランチを切り替えても残り、後の作り直しで別の PR のシナリオを使い回すおそれがある。

`git diff origin/main...HEAD` を読み、画面の見た目か操作の挙動が変わるか（表示文言・スタイル・遷移・toast 等を含む）を判断する。`src/routes/`・`src/components/`・`src/styles.css` の変更は該当しやすいが、サーバー側の変更で表示が変わる場合も含む。

変わらなければ撮影せず、手順7の「動作確認」に「変化なし」と理由を書く。変わるなら次を行う。

1. 作り直しでは、残っているシナリオを最新の差分に合わせて直す。無ければ（新規作成を含む）新しく書く。
2. 確かめたい変化を項目に分け、項目ごとに撮り方を決める。
   - 静的な状態（表示・エラー表示）: PNG（`page.screenshot`）
   - 時間とともに変わる挙動（遷移、toast、入力から保存まで）: webm（`page.screencast`）
3. `.pr-media/scenarios/<内容>.spec.ts` にシナリオを書く。書き方は下の「シナリオの書き方」。
4. `pnpm capture:pr-media` を実行する。`.pr-media/output/` を消してから、本番と同じビルドをシード済みの D1 で起動して撮影する（30〜80 秒）。失敗したら `.pr-media/test-results/` の trace で原因を調べてシナリオを直す。アプリの不具合が原因なら、PR を作らずにユーザーに報告する。
5. 撮影結果を確かめる。
   - PNG は Read tool で開き、意図した状態が映っているかを見る。
   - webm は中身を見られないため、シナリオ内の `expect` が通ったことで最終状態に達したと判断する。
   - `ls -l .pr-media/output` で、各ファイルが 10MB（Free プランの上限）以下であることを確かめる。超えたら録画の区間を短くする。

#### シナリオの書き方

E2E の基盤（`e2e/fixtures.ts`・`e2e/seed.sql`）をそのまま使う。シナリオは使い捨てで、git にも lint・型チェックにも入らない。

```ts
import { randomUUID } from 'node:crypto'
import { expect, test } from '../../e2e/fixtures'

test('一覧を撮影する', async ({ signedInPage }) => {
  await signedInPage.goto('/')
  await signedInPage.screenshot({ path: '.pr-media/output/place-list.png' })
})

test('登録から一覧へ戻るまでを録画する', async ({ signedInPage }) => {
  const placeName = `撮影用の場所 ${randomUUID().slice(0, 8)}`
  await signedInPage.goto('/places/new')
  await signedInPage.screencast.start({
    path: '.pr-media/output/place-registration.webm',
  })
  await signedInPage.screencast.showActions({ duration: 1500 })
  await signedInPage.getByRole('textbox', { name: '場所名' }).fill(placeName)
  await signedInPage.getByRole('button', { name: '保存' }).click()
  await expect(
    signedInPage.getByText(`「${placeName}」を追加しました`),
  ).toBeVisible()
  await expect(signedInPage).toHaveURL('/')
  // 最終状態に達した直後に止めると、最後の画面が動画に入らない
  await signedInPage.waitForTimeout(1500)
  await signedInPage.screencast.stop()
})
```

- ログイン後の画面は `signedInPage`、ログイン画面は `page` を使う。Google の画面は撮れない（外部サービス）ので、手順7の「未実施の確認」に残す。
- 前提データは `e2e/seed.sql` の行を使う（`/places/1` は全属性が入った場所、`/places/2` は場所名だけの場所）。シナリオで作るデータは `randomUUID` で一意な名前にする。
- 出力先は `.pr-media/output/<内容>.png` / `.webm` と、リポジトリ直下からの相対パスで書く。
- `screencast.start` に `size` を渡さない。viewport（375×667）より大きくすると余白が付くだけになる。
- 動画は `showActions({ duration: 1500 })` で操作した場所を見せる。既定の `duration`（500ms）では操作が速すぎて見づらい。注釈を表示している間は次の操作が待たされるため、`duration` を延ばすと動画全体がゆっくりになる（実測: 登録の例で 5 秒 → 10 秒）。`stop()` の前に、最終状態を `expect` で待ってから `waitForTimeout(1500)` を入れる。

### 5. テストの表を作る

`git diff --name-status origin/main...HEAD -- 'tests/**/*.test.ts' 'tests/**/*.test.tsx' 'e2e/*.spec.ts'` で変わったテストファイルを挙げ、ファイルごとの差分から、追加・変更・削除されたテストケース（`test(...)`・`it(...)`）を拾う。1ケース1行で表にする。テストケースを持たない補助ファイル（`tests/setup.ts`・`tests/support/`・`e2e/fixtures.ts`・`e2e/seed.sql`）は表に入れない。変わったテストファイルが無ければ、表と「テストしない観点と理由」の小見出しを書かず、「テスト」に「なし」と、テストが不要な理由を書く。

- 種別: `tests/` 配下の `*.test.tsx`（コンポーネントを描画して検証する）は「単体（画面）」、`*.test.ts` は「単体（純粋関数）」、`e2e/` 配下は「E2E」。ディレクトリでは分けない（`tests/components/` のように `tests/routes/` の外にも画面のテストがあるため）。
- 区分: 追加／変更（テスト名か中身が変わった）／削除。
- `it.each`・`test.each`・`for` で生成するテストは1行にまとめ、ケースを列挙する。
- 観点と期待結果は、テストの中身から書く。
- 表を書いたときは、表に入らない「テストしない観点と理由」も書く（下の層で確認済み・外部サービス・テストする価値が無い、など）。

### 6. タイトルを決める（新規作成のみ）

変更が何をするかを1行で書く（`code-comments` のコミット表題と同じ基準）。Issue のタイトルを流用しない。不具合の Issue では、表題と修正内容が一致するとは限らないため。

### 7. 本文を書く

`.github/pull_request_template.md` を読み、その見出しの順序に沿って `.pr-media/body.md` に本文を書く。

- 先頭行は手順2で決めたもの。
- 各節の中身は `code-comments` Skill（`.claude/skills/code-comments/SKILL.md`）の「コミットログ・PR（Why）」に従う。テンプレートの HTML コメントは案内なので、本文に残さない。
- 材料: Issue（`gh issue view <番号> --comments`）、実装計画（`docs/design-for-ai/issue<番号>-*-implementation-plan.md` があれば）、`git log origin/main..HEAD`、`git diff origin/main...HEAD`。
- 個々のコミットの Why はコミットメッセージにある。本文で同じ内容を繰り返さず、変更全体の要約と、レビュー・マージの判断に要る情報に絞る。
- 撮影した画像・動画は「動作確認」に、撮影ごとに `###` の見出し（`### 1. ` から始まる連番と、何を確かめる撮影かの要点）を付けて載せる。パスは `--attach` に渡すものと同じく、リポジトリ直下からの相対で書く。
  - 画像: `![<何が映っているか>](.pr-media/output/place-list.png)`
  - 動画: 見出しと説明の文のあとに空行を置き、`![](.pr-media/output/place-registration.webm)` だけの段落にする。箇条書きの中・見出しの中・他の文と同じ段落に置くと、プレイヤーではなくリンクになる。
- 「未実施の確認」には、撮影でカバーできないもの（Google ログイン、実機での操作感など）だけを、手順付きのチェックボックスで書く。

### 8. PR を作る・更新する

撮影したファイルを全て `--attach` で渡す（撮影していなければ `--attach` を付けない）。alt は本文に書いたので、`--attach` 側に `#alt` を付けない（動画に付けるとエラーになる）。アップロードは取り消せないので、撮影したものにシードと撮影用のデータ以外が映っていないことを確かめてから実行する。

- 新規作成:
  `gh pr create --base main --title "<手順6のタイトル>" --body-file .pr-media/body.md --attach .pr-media/output/place-list.png --attach .pr-media/output/place-registration.webm`
- 作り直し:
  `gh pr edit <PR番号> --body-file .pr-media/body.md --attach .pr-media/output/place-list.png --attach .pr-media/output/place-registration.webm`

終了コードが 0 でない場合、アップロードは最初の失敗で止まり、それ以降のファイルの参照はローカルパスのまま本文に残る。出力のエラーから原因（形式・サイズ・空ファイル）を直し、`gh pr view --json number` で PR があるかを確かめてから実行し直す。

- PR がある（作り直し、または新規作成で1件以上アップロードできた）: `gh pr edit <PR番号> --body-file .pr-media/body.md` に全てのファイルの `--attach` を付けて実行し直す。
- PR が無い（新規作成で PR が作られなかった）: 同じ `gh pr create` を実行し直す。

### 9. 確かめて報告する

- `gh pr view --json body -q .body | grep -n '](\.pr-media/'` が何も出さないこと（全ての参照がアップロード先に書き換わったこと）を確かめる。本文の文章で `.pr-media/` に触れることはあるので、リンクの形 `](.pr-media/` だけを探す。
- PR の URL を報告する。「未実施の確認」がある場合は、人間がマージ前に行う必要があると伝える。
