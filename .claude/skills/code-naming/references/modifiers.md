# 修飾語

名前の中心になる名詞や動詞に付けて、時間・位置・状態・確からしさなどを補う語の一覧。

## 時間軸

| 語 | 意味 | 例 |
|---|---|---|
| `current` | 今の | `currentTab` |
| `previous` | 1つ前の | `previousScore` |
| `next` | 次の | `nextToken` |
| `first` / `last` | 最初の・最後の | `firstVisit` / `lastPage` |
| `latest` | いちばん新しい | `latestVersion` |
| `original` | 手を加える前の | `originalFileName` |

`last` は「最後の」とも「1つ前の」とも読める。1つ前を表すときは `previous` にする。

## 出来事との前後

| 語 | 意味 | 例 |
|---|---|---|
| `before` / `pre` / `will` | 起きる前 | `beforeSubmit` |
| `after` / `post` / `did` | 起きた後 | `afterRender` |
| `on` | 起きたとき | `onClosed` |

## 階層・関係

| 語 | 意味 |
|---|---|
| `parent` / `child` | 親・子 |
| `sibling` | 同じ親を持つもの |
| `ancestor` / `descendant` | 祖先・子孫 |
| `root` / `leaf` | 一番上・子を持たない末端 |
| `owner` | 持ち主 |
| `related` | 関係がある |
| `source` / `target` | 変換や移動の元・行き先 |

## 状態

動詞の形を変えて、どういう状態にあるかを表す。

| 形 | 意味 | 例 |
|---|---|---|
| 現在分詞（`〜ing`） | 続いている途中 | `running` / `sending` |
| 過去分詞（`〜ed`） | 終わっている | `archived` / `canceled` |
| `〜able` | その動作ができる性質 | `editable` / `sortable` |

## 条件・結果

| 語 | 意味 | 例 |
|---|---|---|
| `If〜` | 条件を満たすときだけ動く | `retryIfFailed` |
| `With〜` | それを伴って行う | `saveWithBackup` |
| `Without〜` | それを抜いて行う | `textWithoutTags` |
| `As〜` | その形にして返す | `exportAsPdf` |
| `By〜` | それを手掛かりにする | `findByUsername` |
| `For〜` | その相手に向けたもの | `discountForMembers` |
| `From〜` / `To〜` | 元・行き先 | `importFromCsv` / `exportToCsv` |

## 数量・過不足

| 語 | 意味 | 例 |
|---|---|---|
| `total` | 合計 | `totalWeight` |
| `remaining` | 差し引いた後に残った分 | `remainingSeats` |
| `extra` | 必須ではない上乗せ分 | `extraOptions` |
| `missing` | 必要なのに足りないもの | `missingFields` |
| `duplicated` | 重なっているもの | `duplicatedEmails` |
| `max` / `min` | 上限・下限 | `maxUploadSize` |
| `default` | 既定の値 | `defaultLanguage` |

## 確からしさ

| 語 | 意味 | 例 |
|---|---|---|
| `maybe` | 期待した値とは限らない | `maybeUser` |
| `raw` | 手を加えていない | `rawHtml` |
| `estimated` | 見込みの値 | `estimatedArrival` |
| `SoFar` | 途中までの値で、この先変わる | `totalSoFar` |

## 注意喚起

危険な操作には、名前が長くなっても危険だと分かる語を付ける。呼び出す側が気付かないまま使えないようにするため。

| 語 | 意味 | 例 |
|---|---|---|
| `dangerous〜` | 使い方を誤ると壊れる | `dangerouslySetHtml` |
| `force〜` | 普段なら止まる条件でも押し切る | `forcePush` |
| `unsafe〜` | 安全のための検査を省いている | `unsafeCast` |
| `deprecated〜` | もう使ってほしくない | `deprecatedLogin` |

## 初期化

| 語 | 品詞 | 意味 |
|---|---|---|
| `init` | 動詞 | 初期化する（`initRouter`） |
| `initial` | 形容詞 | 最初の（`initialState`） |

`init` は動詞、`initial` は形容詞なので取り違えない。「初期化する」の意味で `initial` を使わない。

## 区切り・その他

| 語 | 意味 | 例 |
|---|---|---|
| `separator` / `delimiter` | 区切りに使う文字 | `lineSeparator` |
| `prefix` / `suffix` | 前に付けるもの・後ろに付けるもの | `cacheKeyPrefix` |
| `threshold` | 判定を分ける境目の値 | `lowStockThreshold` |
| `once` | 1回だけ | `logOnce` |
