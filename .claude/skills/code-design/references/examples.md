# 規則ごとの例（TypeScript）

`SKILL.md` の規則1〜8を、悪い例と良い例で示す。例外のメッセージは、規則11の形（どのルールに、どの値が、どう違反したか、どう直すか）で書く。

## 1. データとロジックを同じ場所に置く

悪い例: 呼び出し側がデータを取り出して判断している。同じ判定が他の画面にも複製される。

```ts
type Order = { status: "pending" | "shipped" | "cancelled"; shippedAt?: Date };

if (order.status === "pending") {
  order.status = "cancelled";
}
```

良い例: 判定と状態変更をデータ側に置き、呼び出し側は命じるだけにする。

```ts
class Order {
  constructor(private status: "pending" | "shipped" | "cancelled") {}

  cancel(): Order {
    if (this.status !== "pending") {
      throw new Error(
        `取り消せるのは status が "pending" の注文だけだが、status が "${this.status}" の注文を取り消そうとした。"pending" の注文だけを取り消す`,
      );
    }
    return new Order("cancelled");
  }
}

const cancelledOrder = order.cancel();
```

## 2. 生焼けオブジェクトを作らない

悪い例: 生成後に `init` を呼ばないと使えない。不正な値でも生成できる。

```ts
class DateRange {
  start?: Date;
  end?: Date;
  init(start: Date, end: Date) {
    this.start = start;
    this.end = end;
  }
}
```

良い例: brand 型とパース関数で書く。開始日が終了日より後の値は、パース関数を通らないので作れない。

```ts
const dateRangeSchema = z
  .object({ start: z.date(), end: z.date() })
  .refine(({ start, end }) => start <= end)
  .readonly()
  .brand<"DateRange">();

export type DateRange = z.infer<typeof dateRangeSchema>;

export const parseDateRange = (start: Date, end: Date): DateRange | null => {
  const parsedDateRange = dateRangeSchema.safeParse({ start, end });
  return parsedDateRange.success ? parsedDateRange.data : null;
};
```

参考（標準ではない）: クラスで書く場合は、生成時に全ての値を受け取り、不変条件を検査する。

```ts
class DateRange {
  constructor(
    readonly start: Date,
    readonly end: Date,
  ) {
    if (start > end) {
      throw new RangeError(
        `日付範囲は開始日が終了日以前である必要があるが、開始日 ${start.toISOString()} が終了日 ${end.toISOString()} より後になっている。開始日と終了日を見直す`,
      );
    }
  }
}
```

## 3. 不変を基本にする

悪い例: 引数を書き換え、1つの変数に意味の違う値を再代入している。

```ts
function applyDiscount(prices: number[], rate: number) {
  for (let i = 0; i < prices.length; i++) {
    prices[i] = prices[i] * (1 - rate);
  }
  let price = prices[0];
  price = Math.floor(price); // 税込みの丸めなのか、割引後なのかが読めない
  return price;
}
```

良い例: 新しい配列を返し、意味の違う値には別の変数を用意する。

```ts
function applyDiscount(prices: readonly number[], rate: number): number[] {
  return prices.map((price) => price * (1 - rate));
}
```

適用しない場合の例: 関数内に閉じた集計変数の再代入はよい。

```ts
function sumPrices(prices: readonly number[]): number {
  let total = 0;
  for (const price of prices) total += price;
  return total;
}
```

## 4. ドメインの制約を持つ値は専用の型にする

悪い例: 金額を `number` のまま扱い、負の値の検査があちこちに重複する。数量を金額の位置に渡しても型検査を通る。

```ts
function addFee(amount: number, fee: number): number {
  if (amount < 0 || fee < 0) throw new Error("負の金額");
  return amount + fee;
}
```

良い例: brand 型とパース関数で書き、制約と計算を1つのモジュールに集める。計算の結果もパース関数を通す。

```ts
const moneySchema = z.int().nonnegative().brand<"Money">();

export type Money = z.infer<typeof moneySchema>;

export const parseMoney = (amount: number): Money | null => {
  const parsedMoney = moneySchema.safeParse(amount);
  return parsedMoney.success ? parsedMoney.data : null;
};

export const addMoney = (augend: Money, addend: Money): Money => {
  const totalMoney = parseMoney(augend + addend);
  if (totalMoney === null) {
    throw new RangeError(
      `金額の合計は Number.MAX_SAFE_INTEGER 以下である必要があるが、${augend} と ${addend} の合計 ${augend + addend} がそれを超えた。合計が Number.MAX_SAFE_INTEGER 以下になる金額だけを足す`,
    );
  }
  return totalMoney;
};
```

参考（標準ではない）: クラスで書く場合は、コンストラクタを private にして、static の生成メソッドで制約を検査する。

```ts
class Money {
  private constructor(readonly amount: number) {}

  static of(amount: number): Money {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new RangeError(
        `金額は0以上の整数である必要があるが、${amount} が渡された。0以上の整数を渡す`,
      );
    }
    return new Money(amount);
  }

  add(other: Money): Money {
    return Money.of(this.amount + other.amount);
  }
}
```

## 5. 条件分岐を1か所に集める

悪い例: 同じ種類による switch が複数の関数に散らばる。種類を追加したとき、全てを探して直す必要がある。

```ts
function calculateShippingFee(method: "standard" | "express") {
  switch (method) {
    case "standard": return 500;
    case "express": return 1200;
  }
}

function estimateDeliveryDays(method: "standard" | "express") {
  switch (method) {
    case "standard": return 5;
    case "express": return 1;
  }
}
```

良い例: 種類ごとの振る舞いを interface の実装にまとめる。分岐は生成時の1か所だけになる。

```ts
interface ShippingMethod {
  readonly fee: number;
  readonly deliveryDays: number;
}

const standardShipping: ShippingMethod = { fee: 500, deliveryDays: 5 };
const expressShipping: ShippingMethod = { fee: 1200, deliveryDays: 1 };
```

早期 return の例:

```ts
function canReserve(user: User, seat: Seat): boolean {
  if (!user.isActive) return false;
  if (seat.isReserved) return false;
  return user.age >= seat.minimumAge;
}
```

ポリシーパターンの例:

```ts
interface ReservationRule {
  isSatisfiedBy(user: User, seat: Seat): boolean;
}

class ReservationPolicy {
  constructor(private readonly rules: readonly ReservationRule[]) {}

  allows(user: User, seat: Seat): boolean {
    return this.rules.every((rule) => rule.isSatisfiedBy(user, seat));
  }
}
```

判別可能な union の分岐の例: switch で書き、`never` による網羅の検査は書かない。union に種類を足して case を書き忘れると、`default` 節の有無にかかわらず lint（`useExhaustiveSwitchCases`）が error にする。

```ts
type PaymentStatus =
  | { readonly kind: "unpaid" }
  | { readonly kind: "paid"; readonly paidAt: Date }
  | { readonly kind: "refunded"; readonly refundedAt: Date };

function toPaymentStatusLabel(paymentStatus: PaymentStatus): string {
  switch (paymentStatus.kind) {
    case "unpaid":
      return "未払い";
    case "paid":
      return "支払い済み";
    case "refunded":
      return "返金済み";
  }
}
```

## 6. コレクションを包む

悪い例: 配列をそのまま渡し、上限の検査を呼び出し側に任せている。

```ts
const members: Member[] = [];
if (members.length < 4) members.push(newMember);
```

良い例: 配列と制約を1つの brand 型にまとめ、パース関数で検査する。上限を超えた配列はパース関数を通らないので作れない。外からは読み取り専用の配列として読める。`Member` は `memberSchema` から作った brand 型とする。

```ts
const maxPartyMembers = 4;

const partySchema = z
  .array(memberSchema)
  .max(maxPartyMembers)
  .readonly()
  .brand<"Party">();

export type Party = z.infer<typeof partySchema>;

export const parseParty = (members: readonly Member[]): Party | null => {
  const parsedParty = partySchema.safeParse(members);
  return parsedParty.success ? parsedParty.data : null;
};

export const addPartyMember = (party: Party, member: Member): Party => {
  const addedParty = parseParty([...party, member]);
  if (addedParty === null) {
    throw new Error(
      `パーティーは最大 ${maxPartyMembers} 人までだが、${party.length} 人のパーティーにメンバーを追加しようとした。追加する前に人数を確かめる`,
    );
  }
  return addedParty;
};
```

参考（標準ではない）: クラスで書く場合は、配列を private に持ち、外には `readonly` で渡す。

```ts
class Party {
  static readonly maxMembers = 4;

  private constructor(private readonly members: readonly Member[]) {}

  static empty(): Party {
    return new Party([]);
  }

  add(member: Member): Party {
    if (this.members.length >= Party.maxMembers) {
      throw new Error(
        `パーティーは最大 ${Party.maxMembers} 人までだが、${this.members.length} 人のパーティーにメンバーを追加しようとした。追加する前に人数を確かめる`,
      );
    }
    return new Party([...this.members, member]);
  }

  listMembers(): readonly Member[] {
    return this.members;
  }
}
```

## 7. 結合を弱くする

悪い例: 振る舞いの再利用のために継承し、親クラスの変更が子クラスを壊す。

```ts
class PhysicalAttack {
  calculateDamage(): number { /* ... */ }
}

class DoubleAttack extends PhysicalAttack {
  calculateDamage(): number {
    return super.calculateDamage() * 2; // 親の計算が変わると意図せず変わる
  }
}
```

良い例: 部品として持たせる。

```ts
class DoubleAttack {
  constructor(private readonly baseAttack: PhysicalAttack) {}

  calculateDamage(): number {
    return this.baseAttack.calculateDamage() * 2;
  }
}
```

単一責任の例: 同じ「商品」でも、関心事ごとに型を分ける。

```ts
class ReservedItem { /* 予約に関わるデータとロジックだけ */ }
class StockItem { /* 在庫に関わるデータとロジックだけ */ }
```

## 8. 関数の引数と戻り値を絞る

悪い例: フラグ引数で処理を切り替え、引数を書き換えて結果を返している。

```ts
function saveUser(user: User, isDraft: boolean, errors: string[]) {
  if (!user.name) errors.push("名前が必要");
  if (isDraft) { /* 下書き保存 */ } else { /* 公開保存 */ }
}
```

良い例: 関数を分け、結果は戻り値で返す。

```ts
function validateUser(user: User): string[] {
  return user.name ? [] : ["名前が必要"];
}

function saveUserDraft(user: User): void { /* ... */ }
function publishUser(user: User): void { /* ... */ }
```
