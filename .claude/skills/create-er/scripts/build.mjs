// ER 図の HTML を組み立てる。
// 使い方: node build.mjs <schema.json> <er-meta.json> <出力先.html>
// schema.json は tbls の schema.json と同じ形。er-meta.json の形は SKILL.md を参照。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [schemaPath, metaPath, outPath] = process.argv.slice(2);
if (!outPath) {
  console.error('使い方: node build.mjs <schema.json> <er-meta.json> <出力先.html>');
  process.exit(2);
}

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));

// 名前の食い違いは図から線やテーブルが黙って消える原因になるため、ここで止める
const errors = [];
const columnsOf = new Map((schema.tables ?? []).map(t => [t.name, new Set((t.columns ?? []).map(c => c.name))]));
for (const [i, r] of (schema.relations ?? []).entries()) {
  for (const [table, cols] of [[r.table, r.columns], [r.parent_table, r.parent_columns]]) {
    if (!columnsOf.has(table)) { errors.push(`relations[${i}]: 存在しないテーブル ${table}`); continue; }
    for (const c of cols ?? []) if (!columnsOf.get(table).has(c)) errors.push(`relations[${i}]: ${table} に存在しないカラム ${c}`);
  }
}
const groupOf = new Map();
for (const g of meta.groups ?? []) {
  for (const n of g.tables ?? []) {
    if (!columnsOf.has(n)) errors.push(`groups[${g.id}]: 存在しないテーブル ${n}`);
    else if (groupOf.has(n)) errors.push(`${n} が複数のグループに属している（${groupOf.get(n)}, ${g.id}）`);
    else groupOf.set(n, g.id);
  }
}
for (const n of Object.keys(meta.detailLinks ?? {})) {
  if (!columnsOf.has(n)) errors.push(`detailLinks: 存在しないテーブル ${n}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const ungrouped = [...columnsOf.keys()].filter(n => !groupOf.has(n));
if (ungrouped.length) console.warn(`どのグループにも属さないテーブル（図では「未分類」）: ${ungrouped.join(', ')}`);

// JSON 中の < をエスケープし、</script> で埋め込み先の script 要素が閉じないようにする
const embed = v => JSON.stringify(v).replace(/</g, '\\u003c');
const escapeHtml = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

const template = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../assets/template.html'), 'utf8');
const html = template
  .replace('{{TITLE}}', () => escapeHtml(`${schema.name ?? 'DB'} の ER 図`))
  .replace('{{SCHEMA}}', () => embed(schema))
  .replace('{{META}}', () => embed(meta));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(`${outPath}（テーブル ${columnsOf.size}、リレーション ${(schema.relations ?? []).length}）`);
