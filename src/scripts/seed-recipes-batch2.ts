/**
 * Расширяет каталог: ~22 новых рецепта + товары "Самокат"/"ВкусВилл" + recipe_ingredients.
 * Запуск: npx tsx src/scripts/seed-recipes-batch2.ts
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
// на 100 г продукта
const MACROS: Record<string, Macro> = {
  'Овсяные хлопья': { kcal: 366, protein: 13, fat: 7, carb: 61 },
  'Йогурт натуральный': { kcal: 61, protein: 3.5, fat: 3.2, carb: 4.7 },
  'Смесь ягод': { kcal: 45, protein: 0.7, fat: 0.3, carb: 10 },
  'Молоко 2,5%': { kcal: 52, protein: 2.8, fat: 2.5, carb: 4.7 },
  Мёд: { kcal: 304, protein: 0.3, fat: 0, carb: 79.5 },
  'Куриное филе': { kcal: 165, protein: 31, fat: 3.6, carb: 0 },
  Киноа: { kcal: 368, protein: 14, fat: 6, carb: 64 },
  Брокколи: { kcal: 34, protein: 2.8, fat: 0.4, carb: 7 },
  'Болгарский перец': { kcal: 27, protein: 1, fat: 0.3, carb: 6 },
  'Оливковое масло': { kcal: 900, protein: 0, fat: 100, carb: 0 },
  'Соль и специи': { kcal: 0, protein: 0, fat: 0, carb: 0 },
  Кабачок: { kcal: 17, protein: 1.2, fat: 0.3, carb: 3.1 },
  Помидоры: { kcal: 18, protein: 0.9, fat: 0.2, carb: 3.9 },
  Морковь: { kcal: 41, protein: 0.9, fat: 0.2, carb: 9.6 },
  'Репчатый лук': { kcal: 40, protein: 1.1, fat: 0.1, carb: 9.3 },
  'Нут варёный': { kcal: 164, protein: 9, fat: 2.6, carb: 27 },
  'Яйцо куриное': { kcal: 155, protein: 13, fat: 11, carb: 1.1 },
  'Творог 5%': { kcal: 121, protein: 17, fat: 5, carb: 3 },
  Гречка: { kcal: 343, protein: 13, fat: 3, carb: 62 },
  'Рис бурый': { kcal: 362, protein: 7.5, fat: 2.7, carb: 76 },
  Банан: { kcal: 96, protein: 1.1, fat: 0.3, carb: 22 },
  'Хлеб цельнозерновой': { kcal: 250, protein: 9, fat: 3.5, carb: 45 },
  Авокадо: { kcal: 160, protein: 2, fat: 14.7, carb: 8.5 },
  'Сыр твёрдый': { kcal: 350, protein: 25, fat: 27, carb: 0 },
  'Чечевица варёная': { kcal: 116, protein: 9, fat: 0.4, carb: 20 },
  'Говяжий фарш': { kcal: 250, protein: 17, fat: 20, carb: 0 },
  'Индейка филе': { kcal: 157, protein: 29, fat: 3, carb: 0 },
  Тофу: { kcal: 76, protein: 8, fat: 4.8, carb: 1.9 },
  'Лосось филе': { kcal: 208, protein: 20, fat: 13, carb: 0 },
  Креветки: { kcal: 95, protein: 19, fat: 1.7, carb: 0.5 },
  Шпинат: { kcal: 23, protein: 2.9, fat: 0.4, carb: 3.6 },
  'Фасоль варёная': { kcal: 127, protein: 8.7, fat: 0.5, carb: 22.8 },
  'Кукуруза консервированная': { kcal: 119, protein: 3.3, fat: 1.2, carb: 22.7 },
  Огурцы: { kcal: 15, protein: 0.7, fat: 0.1, carb: 3.6 },
  'Овощная смесь заморож.': { kcal: 60, protein: 2, fat: 0.5, carb: 10 },
};

// { pack_g, приблизительная цена Самокат, цена ВкусВилл }
const PRODUCTS: Record<string, [number, number, number]> = {
  'Овсяные хлопья': [400, 129, 149],
  'Йогурт натуральный': [300, 99, 119],
  'Смесь ягод': [300, 279, 319],
  'Молоко 2,5%': [900, 89, 99],
  Мёд: [250, 349, 389],
  'Куриное филе': [500, 429, 459],
  Киноа: [200, 239, 269],
  Брокколи: [400, 199, 219],
  'Болгарский перец': [500, 189, 209],
  'Оливковое масло': [250, 529, 579],
  'Соль и специи': [40, 89, 99],
  Кабачок: [600, 119, 139],
  Помидоры: [500, 219, 239],
  Морковь: [1000, 69, 79],
  'Репчатый лук': [1000, 49, 59],
  'Нут варёный': [400, 159, 179],
  'Яйцо куриное': [600, 139, 149],
  'Творог 5%': [200, 129, 149],
  Гречка: [800, 109, 119],
  'Рис бурый': [800, 149, 169],
  Банан: [1000, 99, 109],
  'Хлеб цельнозерновой': [350, 119, 139],
  Авокадо: [400, 249, 279],
  'Сыр твёрдый': [200, 259, 289],
  'Чечевица варёная': [400, 149, 169],
  'Говяжий фарш': [500, 399, 429],
  'Индейка филе': [500, 379, 409],
  Тофу: [300, 199, 219],
  'Лосось филе': [400, 599, 649],
  Креветки: [300, 449, 489],
  Шпинат: [150, 149, 169],
  'Фасоль варёная': [400, 129, 149],
  'Кукуруза консервированная': [340, 89, 99],
  Огурцы: [500, 129, 139],
  'Овощная смесь заморож.': [400, 149, 169],
};

type RecipeDef = {
  title: string;
  meal_type: 'завтрак' | 'обед' | 'ужин';
  equipment: 'Плита' | 'Духовка' | 'Мультиварка';
  dietTags: string[];
  cooking_time: number;
  steps: string[];
  ingredients: { name: string; grams: number }[];
};

const RECIPES: RecipeDef[] = [
  // завтраки
  { title: 'Омлет с овощами и сыром', meal_type: 'завтрак', equipment: 'Плита', dietTags: ['ПП', 'Быстро'], cooking_time: 12,
    steps: ['Взбейте яйца с молоком, вылейте на сковороду.', 'Добавьте помидоры, перец и сыр, готовьте под крышкой 5 минут.'],
    ingredients: [{ name: 'Яйцо куриное', grams: 120 }, { name: 'Молоко 2,5%', grams: 40 }, { name: 'Помидоры', grams: 80 }, { name: 'Болгарский перец', grams: 60 }, { name: 'Сыр твёрдый', grams: 30 }] },
  { title: 'Творожная запеканка с ягодами', meal_type: 'завтрак', equipment: 'Духовка', dietTags: ['ПП'], cooking_time: 35,
    steps: ['Смешайте творог, яйцо и мёд, выложите в форму, сверху ягоды.', 'Запекайте 30 минут при 180°C.'],
    ingredients: [{ name: 'Творог 5%', grams: 200 }, { name: 'Яйцо куриное', grams: 60 }, { name: 'Смесь ягод', grams: 80 }, { name: 'Мёд', grams: 20 }] },
  { title: 'Гречневая каша с бананом', meal_type: 'завтрак', equipment: 'Плита', dietTags: ['ПП', 'Быстро'], cooking_time: 15,
    steps: ['Отварите гречку в молоке до готовности.', 'Подавайте с нарезанным бананом и мёдом.'],
    ingredients: [{ name: 'Гречка', grams: 80 }, { name: 'Молоко 2,5%', grams: 150 }, { name: 'Банан', grams: 100 }, { name: 'Мёд', grams: 15 }] },
  { title: 'Тосты с авокадо и яйцом', meal_type: 'завтрак', equipment: 'Плита', dietTags: ['ПП', 'Быстро'], cooking_time: 10,
    steps: ['Обжарьте хлеб, разомните авокадо и выложите сверху.', 'Добавьте варёное яйцо и специи.'],
    ingredients: [{ name: 'Хлеб цельнозерновой', grams: 80 }, { name: 'Авокадо', grams: 100 }, { name: 'Яйцо куриное', grams: 60 }, { name: 'Соль и специи', grams: 3 }] },
  { title: 'Рисовая каша с ягодами в мультиварке', meal_type: 'завтрак', equipment: 'Мультиварка', dietTags: ['ПП'], cooking_time: 30,
    steps: ['Загрузите рис, молоко и мёд в чашу мультиварки.', 'Готовьте в режиме «Каша» 25 минут, добавьте ягоды перед подачей.'],
    ingredients: [{ name: 'Рис бурый', grams: 80 }, { name: 'Молоко 2,5%', grams: 200 }, { name: 'Смесь ягод', grams: 60 }, { name: 'Мёд', grams: 15 }] },
  { title: 'Смузи-боул с йогуртом и бананом', meal_type: 'завтрак', equipment: 'Плита', dietTags: ['Быстро', 'Низкокалорийное'], cooking_time: 8,
    steps: ['Взбейте йогурт, банан и ягоды блендером.', 'Перелейте в миску и подавайте охлаждённым.'],
    ingredients: [{ name: 'Йогурт натуральный', grams: 200 }, { name: 'Банан', grams: 100 }, { name: 'Смесь ягод', grams: 60 }, { name: 'Мёд', grams: 10 }] },
  { title: 'Сырники с йогуртом', meal_type: 'завтрак', equipment: 'Плита', dietTags: ['ПП'], cooking_time: 18,
    steps: ['Смешайте творог, яйцо и сформируйте сырники.', 'Обжарьте по 3 минуты с каждой стороны, подавайте с йогуртом.'],
    ingredients: [{ name: 'Творог 5%', grams: 220 }, { name: 'Яйцо куриное', grams: 60 }, { name: 'Йогурт натуральный', grams: 60 }, { name: 'Мёд', grams: 15 }] },

  // обеды
  { title: 'Гречка с курицей и овощами', meal_type: 'обед', equipment: 'Плита', dietTags: ['ПП'], cooking_time: 25,
    steps: ['Обжарьте куриное филе с луком и морковью.', 'Добавьте отварную гречку, прогрейте вместе 3 минуты.'],
    ingredients: [{ name: 'Гречка', grams: 90 }, { name: 'Куриное филе', grams: 150 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }] },
  { title: 'Запечённая курица с овощами', meal_type: 'обед', equipment: 'Духовка', dietTags: ['ПП', 'Низкокалорийное'], cooking_time: 40,
    steps: ['Выложите курицу и нарезанные овощи на противень, приправьте специями.', 'Запекайте 35 минут при 200°C.'],
    ingredients: [{ name: 'Куриное филе', grams: 180 }, { name: 'Кабачок', grams: 100 }, { name: 'Морковь', grams: 60 }, { name: 'Болгарский перец', grams: 60 }, { name: 'Соль и специи', grams: 3 }] },
  { title: 'Чечевичный суп с овощами', meal_type: 'обед', equipment: 'Плита', dietTags: ['ПП', 'Вегетарианское'], cooking_time: 30,
    steps: ['Обжарьте лук и морковь, добавьте помидоры и воду.', 'Всыпьте чечевицу и варите 20 минут.'],
    ingredients: [{ name: 'Чечевица варёная', grams: 150 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }, { name: 'Помидоры', grams: 80 }] },
  { title: 'Тушёная говядина с овощами в мультиварке', meal_type: 'обед', equipment: 'Мультиварка', dietTags: ['ПП'], cooking_time: 45,
    steps: ['Обжарьте фарш с луком в режиме «Жарка».', 'Добавьте кабачок и морковь, тушите 30 минут в режиме «Тушение».'],
    ingredients: [{ name: 'Говяжий фарш', grams: 180 }, { name: 'Кабачок', grams: 100 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }] },
  { title: 'Салат с нутом и авокадо', meal_type: 'обед', equipment: 'Плита', dietTags: ['Быстро', 'Вегетарианское', 'Низкокалорийное'], cooking_time: 10,
    steps: ['Нарежьте авокадо, огурцы и помидоры.', 'Смешайте с нутом и оливковым маслом.'],
    ingredients: [{ name: 'Нут варёный', grams: 150 }, { name: 'Авокадо', grams: 80 }, { name: 'Помидоры', grams: 80 }, { name: 'Огурцы', grams: 80 }, { name: 'Оливковое масло', grams: 10 }] },
  { title: 'Паста с креветками и шпинатом', meal_type: 'обед', equipment: 'Плита', dietTags: ['Быстро'], cooking_time: 15,
    steps: ['Обжарьте креветки на оливковом масле 3 минуты.', 'Добавьте шпинат и помидоры, прогрейте 2 минуты.'],
    ingredients: [{ name: 'Креветки', grams: 150 }, { name: 'Шпинат', grams: 80 }, { name: 'Помидоры', grams: 80 }, { name: 'Оливковое масло', grams: 10 }] },
  { title: 'Рис с лососем и брокколи', meal_type: 'обед', equipment: 'Духовка', dietTags: ['ПП', 'Низкокалорийное'], cooking_time: 30,
    steps: ['Запеките лосось и брокколи со специями 20 минут при 190°C.', 'Подавайте с отварным рисом.'],
    ingredients: [{ name: 'Лосось филе', grams: 150 }, { name: 'Брокколи', grams: 100 }, { name: 'Рис бурый', grams: 80 }, { name: 'Соль и специи', grams: 3 }] },
  { title: 'Плов с курицей в мультиварке', meal_type: 'обед', equipment: 'Мультиварка', dietTags: ['ПП'], cooking_time: 40,
    steps: ['Обжарьте курицу с луком и морковью в режиме «Жарка».', 'Добавьте рис и воду, готовьте в режиме «Плов» 30 минут.'],
    ingredients: [{ name: 'Куриное филе', grams: 150 }, { name: 'Рис бурый', grams: 90 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }] },

  // ужины
  { title: 'Овощное рагу в мультиварке', meal_type: 'ужин', equipment: 'Мультиварка', dietTags: ['ПП', 'Вегетарианское'], cooking_time: 40,
    steps: ['Загрузите нарезанные овощи в чашу мультиварки.', 'Тушите в режиме «Тушение» 35 минут.'],
    ingredients: [{ name: 'Кабачок', grams: 120 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }, { name: 'Болгарский перец', grams: 60 }] },
  { title: 'Запечённая индейка с кабачком', meal_type: 'ужин', equipment: 'Духовка', dietTags: ['ПП', 'Низкокалорийное'], cooking_time: 35,
    steps: ['Выложите индейку и кабачок на противень, приправьте специями.', 'Запекайте 30 минут при 190°C.'],
    ingredients: [{ name: 'Индейка филе', grams: 180 }, { name: 'Кабачок', grams: 120 }, { name: 'Болгарский перец', grams: 60 }, { name: 'Соль и специи', grams: 3 }] },
  { title: 'Тушёные овощи с тофу', meal_type: 'ужин', equipment: 'Мультиварка', dietTags: ['Вегетарианское', 'ПП'], cooking_time: 30,
    steps: ['Обжарьте тофу кубиками, добавьте овощи.', 'Тушите вместе в режиме «Тушение» 20 минут.'],
    ingredients: [{ name: 'Тофу', grams: 150 }, { name: 'Кабачок', grams: 100 }, { name: 'Морковь', grams: 60 }, { name: 'Брокколи', grams: 80 }] },
  { title: 'Куриный суп с гречкой', meal_type: 'ужин', equipment: 'Плита', dietTags: ['ПП'], cooking_time: 30,
    steps: ['Отварите курицу с морковью и луком до готовности.', 'Добавьте гречку и варите 10 минут.'],
    ingredients: [{ name: 'Куриное филе', grams: 150 }, { name: 'Гречка', grams: 60 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }] },
  { title: 'Овощной плов в мультиварке', meal_type: 'ужин', equipment: 'Мультиварка', dietTags: ['Вегетарианское', 'ПП'], cooking_time: 40,
    steps: ['Обжарьте лук и морковь, добавьте рис и овощную смесь.', 'Готовьте в режиме «Плов» 30 минут.'],
    ingredients: [{ name: 'Рис бурый', grams: 90 }, { name: 'Морковь', grams: 60 }, { name: 'Репчатый лук', grams: 40 }, { name: 'Овощная смесь заморож.', grams: 100 }] },
  { title: 'Салат с фасолью и кукурузой', meal_type: 'ужин', equipment: 'Плита', dietTags: ['Быстро', 'Вегетарианское', 'Низкокалорийное'], cooking_time: 10,
    steps: ['Смешайте фасоль, кукурузу, огурцы и помидоры.', 'Заправьте оливковым маслом.'],
    ingredients: [{ name: 'Фасоль варёная', grams: 150 }, { name: 'Кукуруза консервированная', grams: 80 }, { name: 'Огурцы', grams: 80 }, { name: 'Помидоры', grams: 80 }, { name: 'Оливковое масло', grams: 10 }] },
  { title: 'Запечённый лосось с брокколи', meal_type: 'ужин', equipment: 'Духовка', dietTags: ['ПП', 'Низкокалорийное'], cooking_time: 25,
    steps: ['Выложите лосось и брокколи на противень со специями.', 'Запекайте 20 минут при 190°C.'],
    ingredients: [{ name: 'Лосось филе', grams: 160 }, { name: 'Брокколи', grams: 120 }, { name: 'Соль и специи', grams: 3 }] },
  { title: 'Омлет со шпинатом на ужин', meal_type: 'ужин', equipment: 'Плита', dietTags: ['Быстро', 'ПП'], cooking_time: 10,
    steps: ['Взбейте яйца, вылейте на сковороду.', 'Добавьте шпинат и сыр, готовьте под крышкой 4 минуты.'],
    ingredients: [{ name: 'Яйцо куриное', grams: 120 }, { name: 'Шпинат', grams: 60 }, { name: 'Сыр твёрдый', grams: 30 }] },
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
