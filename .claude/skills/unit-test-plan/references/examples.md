# 規則ごとの例（TypeScript / Vitest）

`SKILL.md` の規則2〜5を、悪い例と良い例で示す。

## 2. 出力値と状態変化を検証する

悪い例: 内部で在庫を減らすメソッドが呼ばれたことを検証している。在庫の持ち方を変えるだけで落ちる。

```ts
it('在庫がある場合は購入に成功する', () => {
  const store = new Store()
  store.addProduct('商品A', 10)
  const decreaseStock = vi.spyOn(store, 'decreaseStock')

  store.purchase('商品A', 3)

  expect(decreaseStock).toHaveBeenCalledWith('商品A', 3)
})
```

良い例: 戻り値と、購入後に観察できる在庫を検証する。

```ts
it('在庫がある場合は購入に成功し在庫が減る', () => {
  // Arrange
  const store = new Store()
  store.addProduct('商品A', 10)

  // Act
  const result = store.purchase('商品A', 3)

  // Assert
  expect(result.succeeded).toBe(true)
  expect(store.stockOf('商品A')).toBe(7)
})
```

## 3. テストダブルは、管理外の依存にだけ使う

悪い例: アプリ内部の価格計算をモックにしている。価格計算の結果が正しいかは確かめられず、計算の呼び出し方を変えると落ちる。

```ts
it('注文を確定すると合計金額が決まる', () => {
  const calculator = { calculate: vi.fn().mockReturnValue(1100) }
  const order = new Order(calculator)

  order.confirm(1000)

  expect(calculator.calculate).toHaveBeenCalledWith(1000)
})
```

良い例: 価格計算は本物を使う。管理外のメール送信だけをモックにし、送った内容を検証する。

```ts
it('注文を確定すると税込の合計金額が購入者にメールで届く', () => {
  // Arrange
  const mailer = { send: vi.fn() }
  const order = new Order(new PriceCalculator(0.1), mailer)

  // Act
  order.confirm(1000)

  // Assert
  expect(mailer.send).toHaveBeenCalledWith(
    expect.objectContaining({ body: expect.stringContaining('1100円') }),
  )
})
```

## 4. AAA パターンで書く

悪い例: 1つのテストで実行と検証を繰り返している。`beforeEach` で作った共有の状態に依存している。

```ts
let store: Store

beforeEach(() => {
  store = new Store()
  store.addProduct('商品A', 5)
})

it('購入すると在庫が減る', () => {
  store.purchase('商品A', 3)
  expect(store.stockOf('商品A')).toBe(2)
  const result = store.purchase('商品A', 3)
  expect(result.succeeded).toBe(false)
})
```

良い例: 準備はファクトリ関数に切り出し、振る舞いごとにテストを分ける。

```ts
const createStoreWithStock = (stock: number): Store => {
  const store = new Store()
  store.addProduct('商品A', stock)
  return store
}

it('在庫と同数の購入で在庫が0になる', () => {
  // Arrange
  const store = createStoreWithStock(5)

  // Act
  store.purchase('商品A', 5)

  // Assert
  expect(store.stockOf('商品A')).toBe(0)
})

it('在庫不足の場合は購入に失敗し在庫は変わらない', () => {
  // Arrange
  const store = createStoreWithStock(2)

  // Act
  const result = store.purchase('商品A', 5)

  // Assert
  expect(result.succeeded).toBe(false)
  expect(store.stockOf('商品A')).toBe(2)
})
```

## 5. 入力違いは `it.each` にまとめる

悪い例: 入力と期待値だけが違うテストを並べている。

```ts
it('税率10%で1000円の場合1100円になる', () => {
  expect(new PriceCalculator(0.1).calculate(1000)).toBe(1100)
})

it('税率8%で500円の場合540円になる', () => {
  expect(new PriceCalculator(0.08).calculate(500)).toBe(540)
})
```

良い例: テーブルの1行を1ケースにする。

```ts
describe('税込価格の計算', () => {
  it.each([
    { taxRate: 0.1, price: 1000, expected: 1100 },
    { taxRate: 0.08, price: 500, expected: 540 },
    { taxRate: 0.1, price: 0, expected: 0 },
  ])('税率$taxRateで$price円の場合$expected円になる', ({ taxRate, price, expected }) => {
    // Arrange
    const calculator = new PriceCalculator(taxRate)

    // Act
    const taxIncludedPrice = calculator.calculate(price)

    // Assert
    expect(taxIncludedPrice).toBe(expected)
  })
})
```

例の税率は簡略化のため小数で扱っている。実際の金額計算では丸めを含めて専用の型にする（`code-design` 規則4）。
