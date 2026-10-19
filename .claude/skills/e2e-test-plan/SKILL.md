---
name: e2e-test-plan
description: E2E テストの対象・シナリオ・書き方を決めるときに使う。速いテストでは検出できないもの（各画面の表示・実バックエンドとの通信による画面の更新・主要フロー・実ブラウザが必要な操作）だけを、ユーザーに見える振る舞いで検証し、独立して決定的に動くテストにする。実装時と、実装計画でテスト方針を決めるときの両方で使う。
metadata:
  trigger: E2E テストの追加・修正、実装計画の E2E テスト方針の決定、E2E テストが落ちた・flaky になったときの対応、E2E テストのレビュー
  language: ja
---

# E2E テストの設計

E2E テストの目的は、速いテスト（型・lint・単体テスト・PBT）では検出できない不具合を、最小の数で、毎回同じ結果になる形で検出することである。E2E は遅く壊れやすいので、数を増やさない。

## 適用範囲

- テスト名・コメント・識別子は `code-comments` と `code-naming` に従う。
- どの種類の不具合を E2E で検出するかは、`test-layering` Skill（`.claude/skills/test-layering/SKILL.md`）の割り当て表が決める。単体テストで確かめる範囲は `unit-test-plan` が決める。本スキルは、E2E に残すものと、その書き方だけを扱う。
- テストの構成（AAA・テスト名に業務上の意味を書く・1テスト1振る舞い・入力違いのまとめ方）は `unit-test-plan` の規則4〜6に従う。Playwright では `it.each` の代わりに、`for` でテストを生成する。
- `await` の付け忘れなど、静的解析で見つけるものは lint の設定で扱い、本スキルでは扱わない。
- Page Object は必須にしない。同じ操作が多くのテストで重複したときに、選択肢の1つとして検討する。

## 設計の手順

手順1〜4は、実装計画の E2E テスト方針を書く前、または E2E テストを書き始める前に通す。手順5は、E2E テストを書き終えたあとに行う。

1. **規則1の4つに当たる動線を列挙する。** 各画面の表示・実バックエンドとの通信による画面の更新・主要フロー・実ブラウザが必要な操作（規則1）に当たるユーザーの操作を、「どういう状態で・何をすると・どうなる」の形で書き出す。
2. **速いテストで検出できるものを除く。** 動線ごとに、確かめたい結果（assert）が検出する不具合を `test-layering` の割り当て表に当てはめる。速いテストで検出できる種類なら、E2E に置かず、速いテストに割り当てる。速いテストでは検出できない種類（規則1の4つ）だけを E2E に残す（規則1）。
3. **動線ごとに前提データの用意の仕方を決める。** シード・fixture・API のどれで用意するかを決める（規則8）。
4. **外部サービスとの境界を決める。** 自分で管理していないサービスへの通信を、どこで止めるか、何で固定するかを決める（規則10）。
5. **不具合を入れて、速いテストで検出できないことを確かめる。** E2E を書いたエージェントが行う。新しく書いた E2E の assert ごとに、その assert が検出する不具合を実装に1か所わざと入れ、速いテスト（`pnpm check`）が落ちるかを確かめる。
   - 速いテストが落ちた: その assert を E2E から削る。
   - 落ちなかったが、速いテストで検出できる種類の不具合だった（`test-layering` の割り当て表）: 速いテストを足し、その assert を E2E から削る。
   - 速いテストでは検出できない種類（規則1の4つ）だった: E2E に残す。

   入れた不具合は確かめるたびに元に戻し、コミットに含めない。未コミットの実装を消さないよう、`git checkout` ではなく、入れた1か所を手で戻す。

完了条件: 残った動線のそれぞれについて、規則1の4つのどれに当たるかを1文で言える。言えない動線は、速いテストに移す。手順5で、残した assert の全てについて、入れた不具合を速いテストが検出しないことを確かめた。

## 規則

### 対象の絞り込み

#### 1. 速いテストで検出できないものだけを E2E に残す

**症状:** 入力の検証ルールのパターンや、表示の細部を E2E で網羅している。単体テストと同じ観点のテストが E2E にもある。

**直し方:** E2E に残すのは、次の4つだけにする。

1. 各画面が表示できるか
2. 実バックエンドとの通信で、画面が更新されるか
3. 主要フロー（利用者が目的を果たすまでの一連の操作）
4. 実ブラウザが必要な操作（jsdom では再現できないもの）

網羅的なケースと、1つの画面の中の表示の細部は単体テストに置き、E2E では代表的な1ケースでつながっていることを確かめる。

**なぜ:** E2E は遅く不安定で、落ちたときに原因の箇所を切り分けにくい。速いテストで検出できることを E2E に置くと、フィードバックが遅くなり、保守の手間だけが増える。

#### 2. 画面上でユーザーに見える振る舞いを検証する

**症状:** アプリ内部の状態、関数の呼び出し、ネットワークのリクエストの細部、DB の行を直接検証している。

**直し方:** 検証するのは、ユーザーが画面で観察できるもの（URL、表示される文言、要素の表示・有効・選択の状態）にする。保存されたことは、DB を直接読むのではなく、保存後に表示される画面で確かめる。

**なぜ:** ユーザーに見えない部分は実装の詳細であり、振る舞いを変えないリファクタリングで変わる。見える振る舞いを検証すれば、ユーザーが壊れたと感じる変更にだけテストが落ちる。

### 要素の探し方

#### 3. ロケーターは role、ラベル、文言の順で選ぶ

**症状:** ボタンやリンクを、表示上の文言ではなくクラス名や要素の種類で探している。

**直し方:** 次の優先順で探す。

1. `getByRole`（role と accessible name）。ボタン・リンク・見出し・入力欄など、role を持つ要素はこれで探す。
2. `getByLabel`。フォームの入力欄で、role では一意に絞れないとき。
3. `getByText`。role を持たない要素（通知のメッセージ、説明文など）。

```ts
await page.getByRole('button', { name: '保存' }).click()
await expect(page.getByText('保存しました')).toBeVisible()
```

**なぜ:** ユーザーや支援技術が要素を見つける手がかりと同じものでテストが要素を探すので、テストが通ることがアクセシビリティの確認にもなり、マークアップの変更で壊れにくい。

#### 4. CSS・XPath・DOM 構造に依存しない

**症状:** `page.locator('.btn-primary')`、`page.locator('div > ul > li:nth-child(2)')`、XPath で要素を探している。

**直し方:** 規則3のロケーターで探す。role や文言では一意に取れない要素にだけ test id を付け、`getByTestId` で探す。test id は、テストとマークアップの間の明示的な契約として扱い、見た目の調整で変えない。

**なぜ:** クラス名や入れ子の構造は、見た目の変更やリファクタリングで頻繁に変わる。構造に依存したテストは、ユーザーから見て何も変わっていない変更で落ちる。

### 待ち方

#### 5. アサーションは web-first にする

**症状:** `expect(await page.getByText('完了').isVisible()).toBe(true)` のように、その瞬間の状態を取り出してから判定している。

**直し方:** locator を `expect` に渡し、`await expect(locator).toBeVisible()`・`toHaveText`・`toHaveURL` などの web-first assertion で判定する。

```ts
await expect(page.getByText('完了')).toBeVisible()
```

**なぜ:** web-first assertion は、条件を満たすまで自動で待って再試行する。即時の判定は、描画や通信のタイミングによって結果が変わる。

#### 6. 固定時間の sleep で待たない

**症状:** `page.waitForTimeout(1000)` や `setTimeout` で、処理が終わるのを待っている。

**直し方:** 操作の自動待機と、web-first assertion に待たせる。locator で表せない値（API の結果、件数の変化など）は `expect.poll` で待つ。

**なぜ:** 固定時間は、環境が遅ければ足りずに落ち、速ければ無駄に待つ。どちらにしても結果が実行環境に左右される。

### 独立性と前提データ

#### 7. テストを独立させる

**症状:** あるテストが、前のテストで作ったデータや遷移した状態を前提にしている。`test.describe.serial` で実行順を固定している。テストを単独で実行すると落ちる。

**直し方:** 各テストは、単独で、どの順序で実行しても通るようにする。DB などの状態をテストどうしで共有するなら、テストで作るデータは実行のたびに一意な値（UUID を含む名前など）にし、件数や並び順のように他のテストの実行で変わる値には依存しない。

**なぜ:** 実行順に依存したテストは、1つの失敗が後続に連鎖し、並列化やテストの絞り込み実行で結果が変わる。失敗の原因が、落ちたテスト自身にあるとは限らなくなる。

#### 8. 前提データは UI 以外の手段で用意する

**症状:** 詳細画面のテストのために、毎回 UI の登録フォームを操作してデータを作っている。

**直し方:** 前提データは、シード・fixture・API の呼び出しで用意する。UI で操作するのは、そのテストで検証したい動線そのものだけにする。

**なぜ:** UI での準備は遅く、準備の途中で落ちると、検証したい動線とは無関係の理由でテストが失敗する。

#### 9. テストのたびに UI でログインしない

**症状:** 各テストの冒頭で、ログイン画面に ID とパスワードを入力している。

**直し方:** ログイン状態は、Cookie の注入や、保存した認証状態（storageState）の再利用で用意する。ログインの動線そのものは、それを検証するテストでだけ通る。認証状態を保存したファイルには資格情報が入るので、git に入れない。

**なぜ:** UI でのログインは全テストを遅くし、ログイン画面の変更が無関係のテストまで落とす。外部の認証サービスを通るなら、規則10の外部依存にもなる。

### 外部依存と時刻

#### 10. 自分で管理していない外部サービスはテストしない

**症状:** テストが、外部の認証サービスや決済サービスの実際の画面を操作している。

**直し方:** 外部サービスとの境界で止める。外部への遷移は、リダイレクト先の URL を確かめるところまでにする。アプリが外部の API を呼んで結果を表示するなら、`page.route` などでレスポンスを固定する。

```ts
await page.route('**/api/weather', (route) =>
  route.fulfill({ json: { forecast: '晴れ' } }),
)
```

**なぜ:** 外部サービスの障害・仕様変更・レート制限で、自分のコードが正しくてもテストが落ちる。自分で直せない失敗は、テストの信頼を下げる。

#### 11. 時刻に依存する振る舞いは時刻を固定する

**症状:** 「今日」「◯分前」などの表示や、期限切れの判定を、実行した時刻のまま検証している。日付の境目や深夜にだけテストが落ちる。

**直し方:** Clock API（`page.clock.setFixedTime`・`page.clock.install` など）で、ブラウザの時刻を固定してから検証する。

```ts
await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'))
```

**なぜ:** 現在時刻は、実行のたびに変わる入力である。固定しないと、同じコードに対して結果が変わる。

### 失敗の扱い

#### 12. flaky なテストをリトライで隠さない

**症状:** ときどき落ちるテストに対して、リトライの回数を増やしたり、`test.fixme` などで黙らせたりして終えている。

**直し方:** 原因を特定して直す。原因は次のどれかであることが多い。

- 独立性: 他のテストのデータや実行順に依存している（規則7）
- 待ち方: 即時の判定や固定時間の待機をしている（規則5・6）
- 外部依存: 管理していないサービスを通っている（規則10）
- 時刻: 実行時刻で結果が変わる（規則11）
- 本番コード側の非決定性: アプリ自体に競合や順序の不定がある。この場合はテストではなくアプリを直す

**なぜ:** リトライで通るテストは、落ちても誰も調べなくなり、本物の不具合による失敗も見逃される。flaky の原因が本番コードにあれば、ユーザーも同じ不具合に当たる。

#### 13. 失敗したら trace で原因を調べる

**症状:** 失敗の原因を確かめずに、sleep を足す・タイムアウトを延ばす・リトライを足して通している。

**直し方:** 失敗時の trace を残す設定にし、Trace Viewer で、失敗した操作の前後の DOM のスナップショット・ネットワーク・コンソールを見て原因を特定する。原因が分かってから、規則12に沿って直す。

**なぜ:** 推測による対処は、原因を残したまま症状だけを隠す。trace には、失敗した瞬間の画面と通信が残っているので、手元で再現できない CI の失敗も調べられる。

## 書き上げたあとのチェック

- [ ] 手順1. 列挙した動線が、規則1の4つのどれかに当たるか
- [ ] 手順2. 速いテストで検出できる種類の不具合を、E2E に割り当てていないか
- [ ] 手順3. 動線ごとに、前提データの用意の仕方が決まっているか
- [ ] 手順4. 外部サービスとの境界が決まっているか
- [ ] 手順5. 新しく書いた E2E の assert ごとに不具合を入れ、速いテストで検出できないことを確かめ、入れた不具合を全て元に戻したか
- [ ] 1. E2E が規則1の4つに絞られ、網羅的なケースと表示の細部が単体テストにあるか
- [ ] 2. 検証が、URL・表示文言・要素の状態など、ユーザーに見えるものだけか
- [ ] 3. ロケーターが role、ラベル、文言の順で選ばれているか
- [ ] 4. CSS・XPath・DOM 構造に依存せず、test id は role や文言で取れない要素だけか
- [ ] 5. アサーションが web-first で、即時の判定をしていないか
- [ ] 6. 固定時間の sleep で待っていないか
- [ ] 7. 各テストが単独でもどの順序でも通り、一意なデータを使い、件数や並び順に依存していないか
- [ ] 8. 前提データが UI 以外の手段で用意されているか
- [ ] 9. ログイン状態が注入・再利用され、認証状態のファイルが git に入っていないか
- [ ] 10. 管理していない外部サービスを通らず、境界で止めているか
- [ ] 11. 時刻に依存する振る舞いで、時刻を固定しているか
- [ ] 12. flaky なテストを、リトライで隠さず原因を直しているか
- [ ] 13. 失敗時の trace が残る設定になっているか

## 出典

- 規則1: Google Testing Blog「Just Say No to More End-to-End Tests」 https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html 、Martin Fowler「The Practical Test Pyramid」 https://martinfowler.com/articles/practical-test-pyramid.html
- 規則1・手順2・手順5: 「AI開発時代だからこそ、テストの役割を見つめ直す」 https://zenn.dev/ababup1192/articles/77b844dcfc1529
- 規則2: Playwright「Best Practices」 https://playwright.dev/docs/best-practices
- 規則3: Playwright「Locators」 https://playwright.dev/docs/locators
- 規則4: Playwright「Locators」 https://playwright.dev/docs/locators 、Testing Library「About Queries — Priority」 https://testing-library.com/docs/queries/about/#priority
- 規則5: Playwright「Assertions」 https://playwright.dev/docs/test-assertions
- 規則6: Playwright「page.waitForTimeout」 https://playwright.dev/docs/api/class-page#page-wait-for-timeout 、「expect.poll」 https://playwright.dev/docs/test-assertions#expectpoll
- 規則7: Playwright「Parallelism」 https://playwright.dev/docs/test-parallel
- 規則8: Playwright「API testing」 https://playwright.dev/docs/api-testing 、「Fixtures」 https://playwright.dev/docs/test-fixtures
- 規則9: Playwright「Authentication」 https://playwright.dev/docs/auth
- 規則10: Playwright「Mock APIs」 https://playwright.dev/docs/mock
- 規則11: Playwright「Clock」 https://playwright.dev/docs/clock 、Martin Fowler「Eradicating Non-Determinism in Tests」 https://martinfowler.com/articles/nonDeterminism.html
- 規則12: Google Testing Blog「Flaky Tests at Google and How We Mitigate Them」 https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html 、Martin Fowler「Eradicating Non-Determinism in Tests」 https://martinfowler.com/articles/nonDeterminism.html
- 規則13: Playwright「Trace viewer」 https://playwright.dev/docs/trace-viewer-intro

各規則の「症状」「直し方」「なぜ」の具体的な記述は、上の出典の趣旨を Claude の知識で補って書いた。出典の原文とは逐語では照合していない。
