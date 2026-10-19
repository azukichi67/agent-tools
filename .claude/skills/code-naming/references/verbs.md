# 動詞の一覧

関数・メソッドの名前の先頭に置く動詞を、場面ごとにまとめた。同じ意味の語が並んでいるところは、**プロジェクトの中ではどれか1つに決めて使う**。同じ処理を `fetch` と書いたり `load` と書いたりすると、読み手は両者に違いがあるのだと受け取る。

## 値を得る

`get` は使わず、値をどうやって得るのかを動詞にする（SKILL.md の規則1）。

| 語 | 意味 | 例 |
|---|---|---|
| `load` | ファイル・データベース・ディスクといった保存先から読み出す | `loadDraft` |
| `fetch` | ネットワークを通して取ってくる | `fetchExchangeRates` |
| `read` | ストリームやバッファから読む | `readChunk` |
| `find` | 条件に合うものを探す。見つからないこともある | `findByIsbn` |
| `search` | 探して複数件を返す | `searchRecipes` |
| `list` | まとめて一覧で返す | `listPendingInvoices` |
| `count` | 数を数える | `countVisitors` |
| `calculate` / `compute` | 計算で求める | `calculateShippingFee` |
| `build` / `compose` | 部品を組み合わせて作る | `buildEmailBody` |
| `resolve` / `determine` | いくつかの材料や規則から1つに絞る | `resolveLocale` |
| `extract` | 全体から一部を抜き出す | `extractHashtags` |
| `select` | 候補の中から選ぶ | `selectWinner` |
| `peek` | 先頭の要素を見るが、取り除かない | `peekMessage` |

## 作る

| 語 | 意味 | 例 |
|---|---|---|
| `create` | 新しいものを作る | `createInvoice` |
| `new` | 新しいものを作る（言語の文法上使える場合） | `newSession` |
| `from` | 既存のデータを元に作る | `fromJson` |
| `of` | 値そのものから作る | `Money.of` |
| `clone` / `copy` | 複製を作る | `cloneTemplate` |
| `init` | 初期化する | `initLogger` |

`init` は動詞で、`initial` は「最初の」を表す形容詞。取り違えない。

## 保存する・変える

| 語 | 意味 | 例 |
|---|---|---|
| `save` | 保存する | `saveDraft` |
| `store` | しまっておく | `storeSessionId` |
| `insert` | 新しい行・要素として書き込む | `insertComment` |
| `update` | すでにあるものを書き換える | `updateProfile` |
| `upsert` | 無ければ作り、あれば書き換える | `upsertSubscription` |
| `commit` | 変更を確定させる | `commitTransaction` |
| `apply` | 変更を反映させる | `applyTheme` |
| `flush` | ためていたものをまとめて送り出す | `flushLogs` |
| `sync` | 別の場所の内容と揃える | `syncBookmarks` |

## 消す

| 語 | 意味 | 例 |
|---|---|---|
| `delete` | 永続化されたものを消す | `deleteComment` |
| `remove` | コレクションから外す | `removeTag` |
| `clear` | 中身を空にする | `clearSelection` |
| `reset` | 最初の状態に戻す | `resetFilters` |
| `purge` / `sweep` | 要らなくなったものをまとめて消す | `purgeExpiredSessions` |

`delete` と `remove` を同じ意味で混ぜて使わない。永続層から消す処理にどちらを使うかを決めておく。

## 変換する

| 語 | 意味 | 例 |
|---|---|---|
| `〜From` | 引数を元に、別の型にして返す（変換後 ← 引数） | `dateFrom(text)` / `Date.from(text)` |
| `〜Of` | 引数の値そのものを、別の型として読み替える（変換後 ← 引数） | `Integer.of(value)` |
| `to〜` | 自分自身を別の型にして返す（自身 → 変換後）。引数を変換する関数には、参照で渡す場合を除いて使わない（SKILL.md の規則9） | `order.toCsv()` / `fooList.map(toBar)` / `R.mapValues(fooById, toBar)` |
| `convert` | 形式を変える | `convertTemperature` |
| `parse` | 文字列を解析して構造にする | `parseQueryString` |
| `serialize` / `deserialize` | 直列化する・直列化したものを元に戻す | `serializeCart` |
| `format` | 表示用の形に整える | `formatPhoneNumber` |
| `normalize` | 表記のゆれを揃える | `normalizeZipCode` |
| `map` | 要素を1つずつ変換する | `mapToViewModel` |

## 検査する

| 語 | 意味 | 例 |
|---|---|---|
| `validate` | 正しいかを調べ、正しくなければ例外かエラーを返す | `validateCoupon` |
| `ensure` | 期待した状態かを調べ、違えば例外を返す。または期待した状態に整える | `ensureDirectory` |
| `assert` | 前提が成り立っているかを確かめる | `assertLoggedIn` |
| `verify` | 正当なものかを照合する | `verifyToken` |

`check` は使わない。真のときに何が成り立つのかが読めない（SKILL.md の規則5）。真偽値を返すなら `booleans.md` の形にする。

## 非同期・スケジューリング

| 語 | 意味 | 例 |
|---|---|---|
| `schedule` / `post` | 実行する処理を待ち行列に積む | `scheduleReminder` |
| `execute` / `start` | 実行を始める | `startImport` |
| `cancel` / `stop` | 実行を止める | `cancelImport` |
| `〜Async` | 非同期で動く版であることを示す | `exportAsync` |
| `〜Sync` | 非同期版があるときの、同期で動く版 | `exportSync` |
| `blocking〜` | 終わるまで呼び出し元を待たせる | `blockingReadConfig` |
| `〜InBackground` | 裏で動かす | `indexInBackground` |
| `await` / `join` | 終わるのを待つ | `awaitShutdown` |

## コールバック

呼ばれるタイミングを名前に入れる。

| 語 | 意味 | 例 |
|---|---|---|
| `on〜` | 何かが起きたときに呼ばれる | `onSubmitted` |
| `before〜` / `pre〜` / `will〜` | 何かが起きる直前に呼ばれる | `beforeDelete` |
| `after〜` / `post〜` / `did〜` | 何かが起きた直後に呼ばれる | `afterLogin` |
| `should〜` | 起こしてよいかを尋ねられる | `shouldClose` |

`will` / `did` の組と `before` / `after` の組を混ぜて使わない。

## コレクション操作

| 語 | 意味 |
|---|---|
| `add` / `append` | 末尾に加える |
| `insert` | 位置を決めて加える |
| `put` | キーと結び付けて加える |
| `remove` | 取り除く |
| `contains` | 含まれているかを調べる |
| `enqueue` / `dequeue` | 待ち行列の最後に加える・最初から取り出す |
| `push` / `pop` | スタックの一番上に積む・一番上から取り出す |
| `filter` | 条件に合う要素だけを残す |
| `reduce` / `aggregate` | 畳み込んで1つの値にする |

## 条件付き実行

| 語 | 意味 | 例 |
|---|---|---|
| `〜IfNeeded` | 必要なときだけ動き、不要なら何もしない | `refreshIfNeeded` |
| `try〜` | 試しに実行し、うまくいかなければ例外かエラーを返す | `tryConnect` |
| `〜OrDefault` | うまくいかなければ既定値を返す | `parseIntOrDefault` |
| `〜OrElse` | うまくいかなければ引数で渡した値を返す | `loadOrElse` |
| `force〜` | 普段なら止まる条件でも押し切って実行する | `forceLogout` |
| `〜Once` | 1回だけ実行する | `initOnce` |

## 状態を切り替える

| 語 | 意味 |
|---|---|
| `enable` / `disable` | 操作できるようにする・できないようにする |
| `activate` / `deactivate` | 有効にする・無効にする |
| `show` / `hide` | 表示する・表示しない |
| `lock` / `unlock` | 鍵をかける・外す |
| `mark〜` | 印を付ける（`markAsArchived`） |

`toggle` は使わない。呼んだ後にどちらの状態になるかが呼び出し側から分からず、状態を追いにくい。`turnOn` / `turnOff` のように、どの状態になるのかを名前で決める。
