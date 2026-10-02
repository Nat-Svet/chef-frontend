/**
 * ШАБЛОН для пакетного добавления новых рецептов в Supabase.
 * Скопируйте блок внутри RECIPES и заполните своими блюдами — никакого
 * программирования не нужно, только данные.
 *
 * 1. Для каждого нового ингредиента добавьте строку в MACROS (КБЖУ на 100 г)
 *    и в PRODUCTS (вес упаковки + цена в Самокате/ВкусВилле).
 * 2. Добавьте рецепт в RECIPES: meal_type, equipment, diet-теги (можно
 *    несколько через запятую), время готовки, шаги, список ингредиентов.
 * 3. Запуск: npx tsx src/scripts/seed-more-recipes.ts
 *
 * Скрипт идемпотентен — повторный запуск с тем же title обновит рецепт,
 * а не создаст дубликат.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = t.slice(eq + 1).trim();
  }
}
loadEnv();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Macro = { kcal: number; protein: number; fat: number; carb: number };

// ---------- 1. Ингредиенты: КБЖУ на 100 г ----------
const MACROS: Record<string, Macro> = {
  // Пример — скопируйте строку и впишите своё название/значения:
  'Тыква': { kcal: 26, protein: 1, fat: 0.1, carb: 6.5 },
  'Киви': { kcal: 61, protein: 1.1, fat: 0.5, carb: 14.7 },
};

// ---------- 2. Товары: [вес упаковки (г), цена Самокат, цена ВкусВилл] ----------
const PRODUCTS: Record<string, [number, number, number]> = {
  Тыква: [1000, 99, 119],
  Киви: [500, 189, 209],
};

type RecipeDef = {
  title: string;
  meal_type: 'завтрак' | 'обед' | 'ужин';
  equipment: 'Плита' | 'Духовка' | 'Мультиварка';
  dietTags: string[]; // из: 'ПП', 'Низкокалорийное', 'Быстро', 'Вегетарианское'
  cooking_time: number;
  steps: string[];
  ingredients: { name: string; grams: number }[];
};

// ---------- 3. Рецепты ----------
const RECIPES: RecipeDef[] = [
  // Пример одного рецепта — удалите или оставьте, добавляйте свои ниже:
  {
    title: 'Тыквенная каша с киви',
    meal_type: 'завтрак',
    equipment: 'Плита',
    dietTags: ['ПП', 'Вегетарианское'],
    cooking_time: 15,
    steps: ['Отварите тыкву до мягкости и разомните в пюре.', 'Подавайте с нарезанным киви.'],
    ingredients: [
      { name: 'Тыква', grams: 200 },
      { name: 'Киви', grams: 80 },
    ],
  },
  // { title: '...', meal_type: 'обед', equipment: 'Духовка', dietTags: ['Быстро'], cooking_time: 20, steps: ['...'], ingredients: [{ name: '...', grams: 100 }] },
];

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

async function seedProducts() {
  const names = Object.keys(PRODUCTS);
  const skus = names.flatMap((n) => [`SMKT-${n}`, `VVILL-${n}`]);
  await supabase.from('store_products').delete().in('sku_id', skus);

  const rows = names.flatMap((name) => {
    const [pack, priceSmkt, priceVvill] = PRODUCTS[name];
    return [
      { store_name: 'Самокат', search_term: name, product_title: `${name} ${pack} г`, price: priceSmkt, sku_id: `SMKT-${name}`, pack_weight_grams: pack, in_stock: true },
      { store_name: 'ВкусВилл', search_term: name, product_title: `${name} ${pack} г (ВВ)`, price: priceVvill, sku_id: `VVILL-${name}`, pack_weight_grams: pack, in_stock: true },
    ];
  });

  const { error } = await supabase.from('store_products').insert(rows);
  if (error) throw error;
  return rows.length;
}

async function seedRecipes() {
  const titles = RECIPES.map((r) => r.title);
  const { data: existing } = await supabase.from('recipes').select('id').in('title', titles);
  const existingIds = (existing ?? []).map((r) => r.id);
  if (existingIds.length) {
    await supabase.from('recipe_ingredients').delete().in('recipe_id', existingIds);
    await supabase.from('recipes').delete().in('id', existingIds);
  }

  let recipesInserted = 0;
  let ingredientsInserted = 0;

  for (const recipe of RECIPES) {
    const tags = [...recipe.dietTags, recipe.equipment];
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: recipe.title,
        instructions: recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        image_url: null,
        cooking_time: recipe.cooking_time,
        meal_type: recipe.meal_type,
        tags,
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error(`Не создался рецепт: ${recipe.title}`);
    recipesInserted += 1;

    const ingredientRows = recipe.ingredients.map((item) => {
      const macro = MACROS[item.name];
      if (!macro) throw new Error(`Нет МАCROS для ингредиента "${item.name}" — добавьте его в MACROS`);
      const factor = item.grams / 100;
      return {
        recipe_id: data.id,
        name: item.name,
        amount_grams: item.grams,
        kcal: round1(macro.kcal * factor),
        protein: round1(macro.protein * factor),
        fat: round1(macro.fat * factor),
        carb: round1(macro.carb * factor),
      };
    });

    const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingredientRows);
    if (ingError) throw ingError;
    ingredientsInserted += ingredientRows.length;
  }

  return { recipesInserted, ingredientsInserted };
}

async function main() {
  const productsInserted = await seedProducts();
  const { recipesInserted, ingredientsInserted } = await seedRecipes();
  console.log(`Товары (Самокат+ВкусВилл): ${productsInserted}`);
  console.log(`Рецепты: ${recipesInserted}`);
  console.log(`Ингредиенты: ${ingredientsInserted}`);
}

main().catch((error) => {
  console.error('Сид не удался:', error);
  process.exit(1);
});
