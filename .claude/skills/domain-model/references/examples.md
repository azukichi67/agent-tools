# 規則ごとの例

`SKILL.md` の規則2と規則6〜8を、通販の業務で示す。クラスの中の書き方は `code-design` の `references/examples.md` に従う。

## 2. コトを軸に関心事を整理する

| 分類 | 例 | 主な業務ロジック |
|---|---|---|
| ヒト | 顧客、配送業者 | 会員ランクの判定 |
| モノ | 商品 | 在庫を引き当てられるかの判定 |
| コト | 受注、出荷、請求、入金 | 受注の取り消し可否、送料・税額の計算、入金の消し込み |

コトの「受注」に、ヒトの「顧客」とモノの「商品」を結びつける。「出荷」「請求」は「受注」に続いて起きるコトとして結びつける。

## 6〜8. サービスクラス

悪い例: サービスクラスが受注のデータを取り出して判断し、送料を計算し、SQL を書いている。取り消せない受注を渡されたときに何が起きるかは、中身を読まないと分からない。

```ts
class OrderService {
  async cancel(orderId: string): Promise<void> {
    const row = await db.query("SELECT * FROM orders WHERE order_id = $1", [orderId]);
    if (row.status !== "pending" || row.shipped_at !== null) {
      return;
    }
    const refund = row.total_price + (row.total_price >= 5000 ? 0 : 500);
    await db.query("UPDATE orders SET status = 'cancelled' WHERE order_id = $1", [orderId]);
    await payment.refund(row.customer_id, refund);
  }
}
```

良い例: 取り消せるかの判断と返金額の計算を受注（`Order`）に任せる。サービスクラスは受注を取り出し、取り消しを命じ、保存する順番だけを決める。DB の読み書きはリポジトリに隠す。使う側は `canCancel` で先に確かめられ、確かめずに取り消せない受注を渡したときは例外になる。

```ts
class OrderCancellationService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly payment: PaymentGateway,
  ) {}

  async canCancel(orderId: OrderId): Promise<boolean> {
    const order = await this.orders.findById(orderId);
    return order.canCancel();
  }

  async cancel(orderId: OrderId): Promise<void> {
    const order = await this.orders.findById(orderId);
    const cancelled = order.cancel();
    await this.orders.save(cancelled);
    await this.payment.refund(cancelled.customerId, cancelled.refundAmount());
  }
}
```
