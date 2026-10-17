# 真偽値の名前

## 判定基準

**`if` の条件部分に入れて、英語の文として読めるか**で判断する。`== true` を補わないと文にならない名前は付け直す。

```ts
if (hasCoupon) {
  // 「クーポンを持っているなら」と読める
}
if (checkCoupon) {
  // 真のときに何が成り立っているのかが分からない
}
```

## 使う6つの形

| 形 | 表すこと | 例 |
|---|---|---|
| `is` ＋形容詞 | 今どういう状態か | `isOpen` / `isHidden` / `isReadonly` |
| `is` / `has` ＋過去分詞 | もう済んでいるか | `isArchived` / `isVerified` / `hasPaid` |
| `can` ＋動詞の原形 | その動作ができるか | `canEdit` / `canDelete` |
| `should` ＋動詞の原形 | その動作をしたほうがよいか | `shouldNotify` / `shouldCompress` |
| `needs` ＋名詞／動詞 | それが必要か | `needsReview` |
| 三人称単数の動詞（＋名詞） | それが成り立つか | `exists` / `includes` / `matchesPattern` |

形ごとの意味の違い:

- `is` — 対象が想定した状態にあるか
- `has` — 対象がそのデータや性質を持っているか
- `can` — 対象自身がその動作をできるか
- `should` — 呼び出す側がその動作をしたほうがよいか
- `needs` — 呼び出す側がその動作をしなければならないか

`can` と `should` は、誰が判断するのかが違う。`can` は対象の能力を答え、`should` は呼び出す側に勧める。

## 使わない3つの形

| 形 | 問題 | 直し方 |
|---|---|---|
| `check` ＋名詞 | 真のときに何が成り立つのかが読めない | 成り立つことを名前にする（`isExpired` / `exists` / `hasErrors`） |
| `is` ＋動詞の原形 | 英語の文にならない | `isFinish` → `isFinished` |
| 動詞の原形＋名詞 | 三人称単数の形になっていない | `matchPattern` → `matchesPattern` |

## 否定形の名前を付けない

`isNotVisible` のような否定形の名前を否定の条件で使うと二重否定になり、読み間違いのもとになる。

```ts
if (!isNotVisible) {
  // 頭の中で一度反転させないと読めない
}
if (isVisible) {
  // そのまま読める
}
```

名前は肯定形にして、否定したいときは使う側で `!` を付ける。ただし、「無い」こと自体がその対象の性質である場合（`isEmpty` / `isMissing`）は、肯定形と同じに扱ってよい。

## 有効・無効を表す語

| 語 | 意味 |
|---|---|
| `valid` / `invalid` | 中身が正しいか（`isValidUrl` / `invalidFields`） |
| `enabled` / `disabled` | 操作できる状態か |
| `active` / `inactive` | 動いている状態か |
| `available` | 使える状態か |
| `required` / `optional` | 必須か、任意か |

## 進行中と完了

| 形 | 意味 | 例 |
|---|---|---|
| 現在分詞（`〜ing`） | まだ続いている | `isSaving` / `isUploading` / `isSyncing` |
| 過去分詞（`〜ed`） | もう終わっている | `isSaved` / `isUploaded` / `isCanceled` |

進行中と完了を1つの真偽値で表さない。状態が3つ以上あるなら真偽値をやめて列挙型にする。TypeScript では文字列リテラルのユニオン型でよい。

```ts
type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'failed';
```
