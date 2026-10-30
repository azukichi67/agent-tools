# PostgreSQL での定義

SKILL.md の規則を PostgreSQL で満たすときの型と関数。

## タイムゾーン付きの日時（規則5・6）

- 型は `timestamptz`（`timestamp with time zone`）にする。
- 作成日時・更新日時のデフォルトは `statement_timestamp()` にする。

```sql
created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
updated_at timestamptz NOT NULL DEFAULT statement_timestamp()
```

## Enum（規則7）

```sql
CREATE TYPE enum_car_type AS ENUM ('SMALL_TRUCK', 'LARGE_TRUCK');
```
