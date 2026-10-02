/**
 * Создаёт товары для новых сетей (Яндекс Лавка, Купер, Пятёрочка, Магнит) на основе
 * каталога Самоката: у каждой сети свой уровень цен + детерминированный разброс
 * ±6% по позициям, чтобы Закупщик находил, где что дешевле, и делил корзину.
 * ЦЕНЫ ТЕСТОВЫЕ (оценочные) — замените реальными, когда появится интеграция.
 * Запуск: npx tsx src/scripts/seed-store-prices.ts   (идемпотентно)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envText = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq > 0 && !process.env[t.slice(0, eq).trim()]) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CHAINS: { name: string; prefix: string; factor: number }[] = [
  { name: 'Яндекс Лавка', prefix: 'LAVKA', factor: 1.04 },
  { name: 'Купер (СберМаркет)', prefix: 'KUPER', factor: 1.02 },
  { name: 'Пятёрочка', prefix: 'PYAT', factor: 0.92 },
  { name: 'Магнит', prefix: 'MAGNIT', factor: 0.9 },
];

function jitter(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  return 1 + ((h % 13) - 6) / 100;
}

async function main() {
  const { data, error } = await supabase
    .from('store_products')
    .select('search_term, product_title, price, pack_weight_grams')
    .eq('store_name', 'Самокат')
    .limit(1000);
  if (error) throw error;
  // в каталоге Самоката встречаются повторяющиеся названия — берём самую дешёвую позицию
  const cheapest = new Map<string, NonNullable<typeof data>[number]>();
  for (const p of data ?? []) {
    const current = cheapest.get(p.search_term);
    if (!current || Number(p.price) < Number(current.price)) cheapest.set(p.search_term, p);
  }
  const base = [...cheapest.values()];
  if (!base.length) throw new Error('В базе нет товаров Самоката');

  for (const chain of CHAINS) {
    const { error: delError } = await supabase.from('store_products').delete().eq('store_name', chain.name);
    if (delError) throw delError;

    const rows = base.map((p) => ({
      store_name: chain.name,
      search_term: p.search_term,
      product_title: `${p.product_title} (${chain.name})`,
      price: Math.max(1, Math.round(Number(p.price) * chain.factor * jitter(chain.name + p.search_term))),
      sku_id: `${chain.prefix}-${p.search_term}`,
      pack_weight_grams: p.pack_weight_grams,
      in_stock: true,
    }));

    for (let i = 0; i < rows.length; i += 100) {
      const { error: insError } = await supabase.from('store_products').insert(rows.slice(i, i + 100));
      if (insError) throw insError;
    }
    console.log(`${chain.name}: ${rows.length} товаров`);
  }
}

main().catch((error) => {
  console.error('Не удалось:', error);
  process.exit(1);
});
