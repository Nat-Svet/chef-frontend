/**
 * Сид recipes, recipe_ingredients и store_products (Самокат).
 * Запуск из корня проекта: npx tsx src/scripts/seed-recipes.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { MOCK_MEALS } from '../data/mock-menu';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('В .env нет EXPO_PUBLIC_SUPABASE_URL или EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RECIPE_TITLES = MOCK_MEALS.map((meal) => meal.title);

type StoreSeed = {
  search_term: string;
  product_title: string;
  price: number;
  sku_id: string;
  pack_weight_grams: number;
};

const SAMOKAT_PRODUCTS: StoreSeed[] = [
  {
    search_term: 'Овсяные хлопья',
    product_title: 'Хлопья овсяные геркулес тонкие 400 г',
    price: 129,
    sku_id: 'SMKT-OATS-400',
    pack_weight_grams: 400,
  },
  {
    search_term: 'Йогурт натуральный',
    product_title: 'Йогурт натуральный 3,2% 300 г',
    price: 99,
    sku_id: 'SMKT-YOG-300',
    pack_weight_grams: 300,
  },
  {
    search_term: 'Смесь ягод',
    product_title: 'Смесь ягод замороженная 300 г',
    price: 279,
    sku_id: 'SMKT-BERRY-300',
    pack_weight_grams: 300,
  },
  {
    search_term: 'Молоко 2,5%',
    product_title: 'Молоко пастеризованное 2,5% 900 мл',
    price: 89,
    sku_id: 'SMKT-MILK-900',
    pack_weight_grams: 900,
  },
  {
    search_term: 'Мёд',
    product_title: 'Мёд цветочный натуральный 250 г',
    price: 349,
    sku_id: 'SMKT-HONEY-250',
    pack_weight_grams: 250,
  },
  {
    search_term: 'Куриное филе',
    product_title: 'Филе грудки цыплёнка охлаждённое 500 г',
    price: 429,
    sku_id: 'SMKT-CHICK-500',
    pack_weight_grams: 500,
  },
  {
    search_term: 'Киноа',
    product_title: 'Киноа белая крупа 200 г',
    price: 239,
    sku_id: 'SMKT-QUINOA-200',
    pack_weight_grams: 200,
  },
  {
    search_term: 'Брокколи',
    product_title: 'Брокколи свежая 400 г',
    price: 199,
    sku_id: 'SMKT-BROC-400',
    pack_weight_grams: 400,
  },
  {
    search_term: 'Болгарский перец',
    product_title: 'Перец сладкий микс 500 г',
    price: 189,
    sku_id: 'SMKT-PEPPER-500',
    pack_weight_grams: 500,
  },
  {
    search_term: 'Оливковое масло',
    product_title: 'Масло оливковое extra virgin 250 мл',
    price: 529,
    sku_id: 'SMKT-OIL-250',
    pack_weight_grams: 250,
  },
  {
    search_term: 'Соль и специи',
    product_title: 'Набор специй для курицы 40 г',
    price: 89,
    sku_id: 'SMKT-SPICE-40',
    pack_weight_grams: 40,
  },
  {
    search_term: 'Кабачок',
    product_title: 'Кабачки свежие 600 г',
    price: 119,
    sku_id: 'SMKT-ZUC-600',
    pack_weight_grams: 600,
  },
  {
    search_term: 'Помидоры',
    product_title: 'Томаты сливовидные 500 г',
    price: 219,
    sku_id: 'SMKT-TOM-500',
    pack_weight_grams: 500,
  },
  {
    search_term: 'Морковь',
    product_title: 'Морковь мытая 1 кг',
    price: 69,
    sku_id: 'SMKT-CARROT-1000',
    pack_weight_grams: 1000,
  },
  {
    search_term: 'Репчатый лук',
    product_title: 'Лук репчатый 1 кг',
    price: 49,
    sku_id: 'SMKT-ONION-1000',
    pack_weight_grams: 1000,
  },
  {
    search_term: 'Нут варёный',
    product_title: 'Нут варёный в собственном соку 400 г',
    price: 159,
    sku_id: 'SMKT-CHICKPEA-400',
    pack_weight_grams: 400,
  },
];

async function seed() {
  const { data: existing, error: existingError } = await supabase
    .from('recipes')
    .select('id, title')
    .in('title', RECIPE_TITLES);

  if (existingError) throw existingError;

  const existingIds = (existing ?? []).map((row) => row.id);
  if (existingIds.length > 0) {
    const { error: deleteIngredientsError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .in('recipe_id', existingIds);
    if (deleteIngredientsError) throw deleteIngredientsError;

    const { error: deleteRecipesError } = await supabase.from('recipes').delete().in('id', existingIds);
    if (deleteRecipesError) throw deleteRecipesError;
  }

  const skuIds = SAMOKAT_PRODUCTS.map((item) => item.sku_id);
  const { error: deleteProductsError } = await supabase
    .from('store_products')
    .delete()
    .eq('store_name', 'Самокат')
    .in('sku_id', skuIds);
  if (deleteProductsError) throw deleteProductsError;

  let recipesInserted = 0;
  let ingredientsInserted = 0;

  for (const meal of MOCK_MEALS) {
    const totalGrams = meal.ingredients.reduce((sum, item) => sum + item.grams, 0) || 1;
    const tags = meal.tags.includes(meal.equipment) ? meal.tags : [...meal.tags, meal.equipment];

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: meal.title,
        instructions: meal.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
        image_url: null,
        cooking_time: meal.cookingTime,
        meal_type: meal.mealType,
        tags,
      })
      .select('id')
      .single();

    if (recipeError || !recipe) throw recipeError ?? new Error(`Не создался рецепт: ${meal.title}`);
    recipesInserted += 1;

    const ingredientRows = meal.ingredients.map((item) => {
      const share = item.grams / totalGrams;
      return {
        recipe_id: recipe.id,
        name: item.name,
        amount_grams: item.grams,
        kcal: Math.round(meal.kcal * share * 10) / 10,
        protein: Math.round(meal.protein * share * 10) / 10,
        fat: Math.round(meal.fat * share * 10) / 10,
        carb: Math.round(meal.carb * share * 10) / 10,
      };
    });

    const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(ingredientRows);
    if (ingredientsError) throw ingredientsError;
    ingredientsInserted += ingredientRows.length;
  }

  const productRows = SAMOKAT_PRODUCTS.map((item) => ({
    store_name: 'Самокат',
    search_term: item.search_term,
    product_title: item.product_title,
    price: item.price,
    sku_id: item.sku_id,
    pack_weight_grams: item.pack_weight_grams,
    in_stock: true,
  }));

  const { error: productsError } = await supabase.from('store_products').insert(productRows);
  if (productsError) throw productsError;

  console.log(`Рецепты: ${recipesInserted}`);
  console.log(`Ингредиенты: ${ingredientsInserted}`);
  console.log(`Товары Самоката: ${productRows.length}`);
}

seed().catch((error) => {
  console.error('Сид не удался:', error);
  process.exit(1);
});
