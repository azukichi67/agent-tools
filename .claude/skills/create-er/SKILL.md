---
name: create-er
description: tbls が出力した DB ドキュメントから、テーブルをドメインごとにまとめたインタラクティブな ER 図の HTML を作る。テーブルをクリックすると関連テーブルが強調され、カラムとコメントが横に出る。
argument-hint: "<tbls の出力ディレクトリ>"
---

# インタラクティブな ER 図を作る

tbls の出力（`tbls doc` が出す Markdown と `schema.json`）から ER 図の HTML を作る。入力を tbls の出力に限ることで、DBMS ごとの差を考えずに済ませる。

あなた（このスキルを実行するエージェント）の仕事は2つだけ。

1. tbls の出力を、tbls の `schema.json` と同じ形のデータにそろえる
2. テーブルをドメインごとのグループに分ける

描画はテンプレートが受け持つ。HTML や JavaScript を書かない。

- テンプレート: `${CLAUDE_SKILL_DIR}/assets/template.html`
- 組み立てスクリプト: `${CLAUDE_SKILL_DIR}/scripts/build.mjs`

`${CLAUDE_SKILL_DIR}` が展開されない環境では、この SKILL.md があるディレクトリに読み替える。

## 手順

### 1. 入力を確かめる

$ARGUMENTS から tbls の出力ディレクトリを取る。無ければユーザーに聞く。

ディレクトリに `README.md` があり、先頭が `# <DB名>` になっていることを確かめる。この DB 名を出力先の名前に使う。

出力先は `git rev-parse --show-toplevel` の直下の `.db-docs/<DB名>/` にする。以下のパスは全てこのトップからの相対パス。

- `.db-docs/` が無ければ作り、中に `*` とだけ書いた `.gitignore` を置く。プロジェクトの `.gitignore` を変更せずに、追跡対象から外すため
- `/tmp` に出力しない。コンテナの `/tmp` はホストのブラウザから見えないため

### 2. schema.json を用意する

入力ディレクトリに `schema.json` があれば、そのまま使う。中身を書き写さない。

無ければ、`README.md` と全テーブルの md を読み、同じ形の JSON を `.db-docs/<DB名>/schema.json` に書く。図が使うのは次の項目だけ。

```json
{
  "name": "DB名",
  "desc": "README の Description",
  "tables": [{
    "name": "public.posts",
    "type": "BASE TABLE",
    "comment": "テーブル md の Description",
    "columns": [{ "name": "id", "type": "bigint", "nullable": false, "comment": "" }],
    "constraints": [{ "type": "PRIMARY KEY", "columns": ["id"] }]
  }],
  "relations": [{
    "table": "public.posts", "columns": ["user_id"],
    "parent_table": "public.users", "parent_columns": ["id"],
    "cardinality": "zero_or_more", "parent_cardinality": "exactly_one",
    "def": "FOREIGN KEY (user_id) REFERENCES users(id)", "virtual": false
  }]
}
```

md から読み取るときの対応:

| 項目 | md の読み取り元 |
|---|---|
| `tables[].name` / `type` | README の Tables 表の Name / Type |
| `tables[].comment` | テーブル md の `## Description` |
| `columns` | テーブル md の Columns 表の Name / Type / Nullable / Comment |
| `constraints` | Constraints 表の Type が `PRIMARY KEY` の行。Definition の括弧内をカラムにする |
| `relations`（FK） | Constraints 表の Type が `FOREIGN KEY` の行。Definition の `FOREIGN KEY (a) REFERENCES b(c)` から取る |
| `relations`（仮想） | Columns 表の Parents 列にあるのに、FK の行が無いもの。`virtual: true`、`parent_columns` は親テーブルの主キーとし、`def` に「md の Parents 列から推定」と書く |

- `REFERENCES` の後ろのテーブル名はスキーマ名が省かれることがある（`users`）。README の Tables 表の名前（`public.users`）に合わせる
- カーディナリティは md に書かれていない。子側は `zero_or_more` にする。親側は FK のカラムが全て NOT NULL なら `exactly_one`、1つでも NULL を許すなら `zero_or_one` にする。FK のカラムに UNIQUE 制約があれば、子側を `zero_or_one` にする

### 3. グループに分ける

グループは `.db-docs/<DB名>/er-meta.json` に書く。

```json
{
  "groups": [
    { "id": "post", "name": "投稿", "desc": "ユーザーの投稿とそのコメント", "source": "viewpoint", "tables": ["public.posts", "public.comments"] }
  ],
  "detailLinks": {}
}
```

- **viewpoints があればそれを使う。** README の `## Viewpoints` 節、または schema.json の `viewpoints`。viewpoint 1つを1グループにし、`source` は `viewpoint` にする
  - schema.json の `viewpoints[].tables` には `public.post*` のようなワイルドカードが入ることがある。テーブル名に展開してから `tables` に書く
  - 1つのテーブルが複数の viewpoint に出るときは、FK でつながるテーブルが多い方に入れる
  - どの viewpoint にも入らないテーブルは、次の項目の分け方で `source: ai` のグループに入れる
- **viewpoints が無ければ、あなたが分ける。** `source` は `ai` にする。図には「AI が推定した分類」と表示される。分け方は次のとおり
  - FK でつながったテーブルの塊を基本にする
  - テーブル名の接頭辞（`order_`、`user_` など）と、コメントに書かれた業務の言葉で補う
  - 1グループはおよそ 3〜15 テーブル。多くのグループから参照されるマスタ（`users` など）は、独立したグループにする
  - `name` は業務の言葉にする（例: 受注、在庫）。`desc` は、そのグループが何を記録するかを1文で書く
- 全てのテーブルをどこか1つのグループに入れる。どこにも入らないテーブルは、図では「未分類」になる
- `detailLinks` は explain-db が使う。このスキルを単独で使うときは空にする

### 4. HTML を組み立てる

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build.mjs <schema.json> .db-docs/<DB名>/er-meta.json .db-docs/<DB名>/er.html
```

スクリプトは、リレーションとグループに出てくるテーブル名・カラム名が schema.json に存在するかを確かめる。エラーが出たら schema.json か er-meta.json を直し、エラーが無くなるまで実行し直す。名前が食い違ったままだと、図から線やテーブルが黙って消えるため。

### 5. 報告する

`er.html` のパスを報告し、ホストのブラウザで開くよう伝える。このスキルは描画結果を自分では確かめないため、開いたら次を見てもらう。

- テーブルや線が重なって読めない箇所が無いか
- グループの分け方が実態と合っているか

グループの直しを頼まれたら、`er-meta.json` を直して手順4を実行し直す。

## トラブルシューティング

| 症状 | 対応 |
|---|---|
| 「elkjs を読み込めない」と出る | ブラウザが cdn.jsdelivr.net に到達できていない。ネットワークを確かめてもらう |
| 線が1本も出ない | `relations` が空か、テーブル名が食い違っている。手順4のスクリプトをもう一度実行する |
| 1つのグループが縦に長すぎる | FK でつながらないテーブルが同じ列に並んでいる。グループを分ける |
