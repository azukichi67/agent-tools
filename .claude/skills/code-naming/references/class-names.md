# クラス・インタフェースの名前

## 基本

- クラスと型には名詞を付け、それが何であるかを表す。
- インタフェースには、性質を表す形容詞（`Iterable` / `Closeable` / `Comparable`）か、役割を表す名詞（`〜Repository` / `〜Sender`）を付ける。
- 意味の広い名詞はあらゆる関心事の処理を呼び込むので、どの関心事を扱うのかを名前に入れる（SKILL.md の規則3）。

## 役割を表す語

役割の決まった語を使えば、クラス名を見ただけで、そのクラスがどこまでを受け持つのかが伝わる。

### 外部とやり取りする

| 語 | 役割 | 例 |
|---|---|---|
| `Client` | 外部サービスと通信する窓口 | `WeatherApiClient` |
| `Gateway` | 外部システムへの出入りを1か所に集める | `ShippingGateway` |
| `Repository` | 永続化したデータを出し入れする | `InvoiceRepository` |
| `Store` / `Storage` | データをしまっておく場所そのもの | `DraftStore` |
| `Registry` | 登録したものを引き当てる台帳 | `PluginRegistry` |
| `Cache` | 一時的に持っておき、使い回す | `ThumbnailCache` |
| `Sender` / `Publisher` | 外へ送り出す | `EmailSender` |
| `Receiver` / `Subscriber` | 外から受け取る | `PaymentEventSubscriber` |

### データを加工する

| 語 | 役割 | 例 |
|---|---|---|
| `Filter` | 条件で絞る | `SpamFilter` |
| `Extractor` | 中から抜き出す | `KeywordExtractor` |
| `Formatter` | 表示用に整える | `DateFormatter` |
| `Collector` | 集めて1つにまとめる | `MetricsCollector` |
| `Converter` / `Mapper` | 別の型に移し替える | `OrderResponseMapper` |
| `Validator` | 正しいかを調べる | `PostalCodeValidator` |
| `Builder` | 少しずつ組み立てる | `ReportBuilder` |
| `Factory` | 作る手順をひとまとめにする | `ConnectionFactory` |

### 判断する

| 語 | 役割 | 例 |
|---|---|---|
| `Specification` | 条件を満たすかを判定する規則そのもの | `FreeShippingSpecification` |
| `Policy` | どれを選ぶかの方針 | `CancellationPolicy` |
| `Rule` | 1つ1つの規則 | `UsernameFormatRule` |
| `Resolver` | いくつかの材料から1つを決める | `LocaleResolver` |
| `Strategy` | 入れ替えられる手順 | `ShippingFeeStrategy` |

### 実行する

| 語 | 役割 | 例 |
|---|---|---|
| `Job` / `Task` | 実行する単位 | `ThumbnailJob` |
| `Runner` / `Executor` / `Worker` | 実行する側 | `ThumbnailJobRunner` |
| `Scheduler` | いつ実行するかを決める | `ReminderScheduler` |
| `Handler` / `Dispatcher` | 受け取ったものを処理先に振り分ける | `CommandDispatcher` |
| `Listener` / `Watcher` | 変化を見張る | `FileWatcher` |

### 記録・設定

| 語 | 役割 | 例 |
|---|---|---|
| `Logger` | 記録を書き出す | `AccessLogger` |
| `Log` / `History` | 書き残された記録 | `LoginHistory` |
| `Configuration` / `Setting` / `Preference` | 設定の値 | `NotificationPreference` |
| `Migrator` | 版の違いを埋めてデータを移す | `SchemaMigrator` |

### まとめる

| 語 | 役割 | 例 |
|---|---|---|
| `Facade` | 込み入った内部を1つの窓口の裏に隠す | `BookingFacade` |
| `Provider` | 値がどこから来るかを隠して渡す | `ClockProvider` |
| `Adapter` | 形の合わない型どうしをつなぐ | `LegacyPrinterAdapter` |

## 避けるクラス名

| 名前 | 起きること | 直し方 |
|---|---|---|
| `〜Manager` | 「管理」の範囲が決まらず、あらゆる処理が流れ込んで膨らむ | 実際に行う動作ごとに分ける（`〜Repository` / `〜Factory` / `〜Scheduler` など） |
| `〜Util` / `〜Helper` | どこにも属さない関数の置き場になり、増え続ける | 扱う型の名前を付けたクラスにするか、その型のメソッドにする |
| `〜Info` / `〜Data` / `〜Item` | 接尾辞が無くても意味が変わらないことが多い。変わるなら中身が決まっていない | 取れるなら取る。取れないなら、何の情報なのかを名前にする |
| `〜Base` / `Abstract〜` / `Common〜` | 継承の都合を名前にしているだけで、それが何なのかを表していない | そのクラスが何を表すのかを名詞で言い表す |
| `Service` | フレームワークが定める `Service` と意味がぶつかりやすい | フレームワークの用語として使うときだけ使い、それ以外は役割を表す語を選ぶ |

`Controller` は、MVC のように枠組みが役割を決めているなら使ってよい。枠組みの外で「何かを制御するもの」という意味で使うと、`Manager` と同じことが起きる。

## 対になる型の名前を揃える

インタフェースと実装のような対になる型は、名前の中心部分を揃える。実装には、何を使って実現しているのかを接頭辞にする。`〜Impl` は何で実現しているのかを伝えないので使わない。

```ts
interface SmsSender {
  send(phoneNumber: string, text: string): Promise<void>;
}

class TwilioSmsSender implements SmsSender {
  async send(phoneNumber: string, text: string): Promise<void> {
    /* … */
  }
}
```
