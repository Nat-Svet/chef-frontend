/**
 * Добавляет рецептам теги аудиторных целей питания: «Сытное» и «Семейное»
 * и «Вегетарианское» для завтраков. Идемпотентно — дубликаты не создаются.
 * Запуск: npx tsx src/scripts/seed-audience-tags.ts
 * ВАЖНО: seed-recipes-batch2.ts пересоздаёт рецепты и сбрасывает эти теги —
 * после его запуска выполните этот скрипт повторно.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
for (const line of text.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq > 0 && !process.env[t.slice(0, eq).trim()]) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const HEARTY = [
  'Куриное филе с киноа и овощами',
  'Омлет с овощами и сыром',
  'Тосты с авокадо и яйцом',
  'Сырники с йогуртом',
  'Гречка с курицей и овощами',
  'Запечённая курица с овощами',
  'Тушёная говядина с овощами в мультиварке',
  'Паста с креветками и шпинатом',
  'Рис с лососем и брокколи',
  'Плов с курицей в мультиварке',
  'Запечённая индейка с кабачком',
  'Куриный суп с гречкой',
  'Запечённый лосось с брокколи',
  'Омлет со шпинатом на ужин',
];

const FAMILY = [
  'Овсянка с ягодами и йогуртом',
  'Омлет с овощами и сыром',
  'Творожная запеканка с ягодами',
  'Гречневая каша с бананом',
  'Рисовая каша с ягодами в мультиварке',
  'Сырники с йогуртом',
  'Гречка с курицей и овощами',
  'Запечённая курица с овощами',
  'Плов с курицей в мультиварке',
  'Овощное рагу в мультиварке',
  'Куриный суп с гречкой',
  'Овощной плов в мультиварке',
  'Омлет со шпинатом на ужин',
];

async function main() {
  const { data, error } = await supabase.from('recipes').select('id, title, meal_type, tags');
  if (error) throw error;

  let updated = 0;
  for (const recipe of data ?? []) {
    const extra = [HEARTY.includes(recipe.title) && 'Сытное', FAMILY.includes(recipe.title) && 'Семейное',
      // все завтраки в каталоге без мяса и рыбы
      recipe.meal_type === 'завтрак' && 'Вегетарианское',
    ].filter(
      Boolean,
    ) as string[];
    const tags = [...new Set([...(recipe.tags ?? []), ...extra])];
    if (tags.length === (recipe.tags ?? []).length) continue;

    const { error: updateError } = await supabase.from('recipes').update({ tags }).eq('id', recipe.id);
    if (updateError) throw updateError;
    updated += 1;
  }
  console.log(`Обновлено рецептов: ${updated}`);
}

main().catch((error) => {
  console.error('Не удалось:', error);
  process.exit(1);
});
