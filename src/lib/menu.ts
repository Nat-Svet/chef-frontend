import { EQUIPMENT_TAGS, WEEK_DAYS, type WeekDay } from '@/constants/catalog';
import type { TimewebMenu } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { MealType, Recipe, RecipeIngredient, StoreProduct } from '@/lib/types';

export type MealIngredient = {
  name: string;
  grams: number;
};

export type Meal = {
  id: number;
  mealType: MealType;
  title: string;
  cookingTime: number;
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
  tags: string[];
  equipment: string;
  emoji: string;
  ingredients: MealIngredient[];
  steps: string[];
};

export type GeneratedMenu = {
  userId: string;
  isFallback: boolean;
  /** Сколько порций покупаем; у старых сохранённых меню поля нет — считаем 1. */
  portions: number;
  /** Отвергнутые пользователем рецепты («Массив исключений» для замены блюда). */
  rejectedIds: number[];
  store: string;
  totalCost: number;
  nutrition: { kcal: number; protein: number; fat: number; carb: number } | null;
  zeroWasteNotes: string;
  scarcityNotice: string | null;
  /** Не пусто, только если при заданном бюджете и фильтрах уложиться в лимит невозможно. */
  budgetNotice: string | null;
  days: { day: WeekDay; breakfastId: number; lunchId: number; dinnerId: number }[];
  recipes: Record<number, Meal>;
  shoppingItems: ShoppingItem[];
};

export type ShoppingCategory = 'Овощи и фрукты' | 'Мясо и птица' | 'Молочные продукты' | 'Бакалея';

export type ShoppingItem = {
  name: string;
  grams: number;
  category: ShoppingCategory;
  /** Цена целых упаковок: packs × цена упаковки. */
  price: number;
  store: string;
  /** Число целых упаковок к покупке (0 — товар не найден в каталоге, цена оценочная). */
  packs: number;
  /** Вес одной упаковки, г. */
  packGrams: number;
  packTitle: string;
};

const MEAL_EMOJI: Record<MealType, string> = {
  завтрак: '🥣',
  обед: '🍗',
  ужин: '🍲',
};


const CATEGORY_ORDER: ShoppingCategory[] = [
  'Овощи и фрукты',
  'Мясо и птица',
  'Молочные продукты',
  'Бакалея',
];

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  'Овощи и фрукты': '🥦',
  'Мясо и птица': '🍗',
  'Молочные продукты': '🥛',
  Бакалея: '🫙',
};

const INGREDIENT_CATEGORY: Record<string, ShoppingCategory> = {
  'Смесь ягод': 'Овощи и фрукты',
  Брокколи: 'Овощи и фрукты',
  'Болгарский перец': 'Овощи и фрукты',
  Кабачок: 'Овощи и фрукты',
  Помидоры: 'Овощи и фрукты',
  Морковь: 'Овощи и фрукты',
  'Репчатый лук': 'Овощи и фрукты',
  'Куриное филе': 'Мясо и птица',
  'Йогурт натуральный': 'Молочные продукты',
  'Молоко 2,5%': 'Молочные продукты',
  'Овсяные хлопья': 'Бакалея',
  Киноа: 'Бакалея',
  Мёд: 'Бакалея',
  'Оливковое масло': 'Бакалея',
  'Соль и специи': 'Бакалея',
  'Нут варёный': 'Бакалея',
};

/** Вес одного яйца категории С1 — 55–60 г. */
export const EGG_GRAMS = 60;

export function isEgg(name: string) {
  return /яйц/i.test(name);
}

export function eggPieces(grams: number) {
  return Math.max(1, Math.round(grams / EGG_GRAMS));
}

/** Количество для показа: яйца — всегда в штуках, остальное — в граммах. */
export function formatAmount(name: string, grams: number) {
  if (isEgg(name)) return `${eggPieces(grams)} шт.`;
  if (grams < 10) {
    return `${grams.toFixed(1).replace('.', ',')} г`;
  }
  return `${Math.round(grams)} г`;
}

export function formatGrams(gramsPerPortion: number, portions: number) {
  return formatAmount('', gramsPerPortion * portions);
}

/** Название упаковки для списка покупок; у яиц вместо граммов — штуки в упаковке. */
export function packLabel(item: ShoppingItem) {
  const title = isEgg(item.name) ? `${item.name}, ${eggPieces(item.packGrams)} шт.` : item.packTitle;
  return item.packs > 1 ? `${item.packs} × ${title}` : title;
}

/** Забота о пользователе: сколько реально нужно и что останется на кухне. null — подсказка не нужна. */
export function leftoverHint(item: ShoppingItem) {
  if (item.packs <= 0 || item.packs * item.packGrams - item.grams < item.packGrams * 0.03) return null;
  return `Понадобится ${formatAmount(item.name, item.grams)}. Остаток останется на вашей кухне на следующую неделю!`;
}

export function groupShoppingList(items: ShoppingItem[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    emoji: CATEGORY_EMOJI[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

export function mealsForDay(menu: GeneratedMenu, day: WeekDay): Meal[] {
  const row = menu.days.find((item) => item.day === day) ?? menu.days[0];
  if (!row) return [];

  return [
    { id: row.breakfastId, type: 'завтрак' as const },
    { id: row.lunchId, type: 'обед' as const },
    { id: row.dinnerId, type: 'ужин' as const },
  ]
    .map(({ id, type }) => {
      const meal = menu.recipes[id];
      return meal ? { ...meal, mealType: meal.mealType || type } : null;
    })
    .filter((item): item is Meal => item !== null);
}

export async function hydrateGeneratedMenu(
  userId: string,
  raw: TimewebMenu,
  isFallback: boolean,
  portions = 1,
): Promise<GeneratedMenu> {
  const days = WEEK_DAYS.map((day, index) => {
    const row = raw.days.find((item) => item.day === day) ?? raw.days[index];
    return {
      day,
      breakfastId: Number(row?.breakfastId),
      lunchId: Number(row?.lunchId),
      dinnerId: Number(row?.dinnerId),
    };
  });

  const recipeIds = [
    ...new Set(days.flatMap((item) => [item.breakfastId, item.lunchId, item.dinnerId])),
  ].filter((id) => Number.isFinite(id));

  const [recipesResult, ingredientsResult, productsResult] = await Promise.all([
    supabase.from('recipes').select('*').in('id', recipeIds),
    supabase.from('recipe_ingredients').select('*').in('recipe_id', recipeIds),
    supabase.from('store_products').select('*'),
  ]);

  if (recipesResult.error) throw recipesResult.error;
  if (ingredientsResult.error) throw ingredientsResult.error;
  if (productsResult.error) throw productsResult.error;

  const recipes: Record<number, Meal> = {};
  for (const recipe of (recipesResult.data ?? []) as Recipe[]) {
    const ingredients = ((ingredientsResult.data ?? []) as RecipeIngredient[]).filter(
      (item) => item.recipe_id === recipe.id,
    );
    recipes[recipe.id] = toMeal(recipe, ingredients);
  }

  const menu: GeneratedMenu = {
    userId,
    isFallback,
    portions,
    rejectedIds: [],
    store: raw.store,
    totalCost: Number(raw.totalCost) || 0,
    nutrition: raw.nutrition,
    zeroWasteNotes: raw.zeroWasteNotes || '',
    scarcityNotice: raw.scarcityNotice ?? null,
    budgetNotice: raw.budgetNotice ?? null,
    days,
    recipes,
    shoppingItems: [],
  };

  menu.shoppingItems = buildShoppingItems(menu, (productsResult.data ?? []) as StoreProduct[]);
  menu.totalCost = menu.shoppingItems.reduce((sum, item) => sum + item.price, 0);
  return menu;
}

/** Точечная замена одного блюда (кнопка «Изменить меню»): подменяет id в
 *  нужном слоте, при необходимости догружает карточку рецепта из Supabase
 *  и пересчитывает список покупок с нуля. */
export async function swapMeal(
  menu: GeneratedMenu,
  day: WeekDay,
  mealType: MealType,
  newRecipeId: number,
): Promise<GeneratedMenu> {
  let meal = menu.recipes[newRecipeId];

  if (!meal) {
    const [recipeResult, ingredientsResult] = await Promise.all([
      supabase.from('recipes').select('*').eq('id', newRecipeId).single(),
      supabase.from('recipe_ingredients').select('*').eq('recipe_id', newRecipeId),
    ]);
    if (recipeResult.error || !recipeResult.data) {
      throw recipeResult.error ?? new Error('Рецепт не найден');
    }
    meal = toMeal(recipeResult.data as Recipe, (ingredientsResult.data ?? []) as RecipeIngredient[]);
  }

  const key = mealType === 'завтрак' ? 'breakfastId' : mealType === 'обед' ? 'lunchId' : 'dinnerId';
  const previousId = menu.days.find((row) => row.day === day)?.[key];
  const days = menu.days.map((row) => (row.day === day ? { ...row, [key]: newRecipeId } : row));
  const rejectedIds = previousId === undefined ? (menu.rejectedIds ?? []) : [...new Set([...(menu.rejectedIds ?? []), previousId])];
  const recipes = { ...menu.recipes, [newRecipeId]: meal };

  const nextMenu: GeneratedMenu = { ...menu, days, recipes, rejectedIds, shoppingItems: [] };

  const { data: products, error } = await supabase.from('store_products').select('*');
  if (error) throw error;

  nextMenu.shoppingItems = buildShoppingItems(nextMenu, (products ?? []) as StoreProduct[]);
  nextMenu.totalCost = nextMenu.shoppingItems.reduce((sum, item) => sum + item.price, 0);

  return nextMenu;
}

function toMeal(recipe: Recipe, ingredients: RecipeIngredient[]): Meal {
  const mealType = (recipe.meal_type ?? 'обед') as MealType;
  const equipment = recipe.tags.find((tag) => (EQUIPMENT_TAGS as readonly string[]).includes(tag)) ?? 'Плита';

  return {
    id: recipe.id,
    mealType,
    title: recipe.title,
    cookingTime: recipe.cooking_time ?? 0,
    kcal: Math.round(sum(ingredients.map((item) => item.kcal))),
    protein: Math.round(sum(ingredients.map((item) => item.protein))),
    fat: Math.round(sum(ingredients.map((item) => item.fat))),
    carb: Math.round(sum(ingredients.map((item) => item.carb))),
    tags: recipe.tags,
    equipment,
    emoji: MEAL_EMOJI[mealType],
    ingredients: ingredients.map((item) => ({
      name: item.name,
      grams: item.amount_grams ?? 0,
    })),
    steps: parseSteps(recipe.instructions),
  };
}

function parseSteps(instructions: string | null) {
  if (!instructions) return [];
  return instructions
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean);
}

/** Корзина из целых заводских упаковок: граммы суммируются по товару магазина,
 *  затем округляются вверх до числа упаковок; цена = упаковки × цена упаковки.
 *  Тот же расчёт делает Закупщик на сервере, поэтому чек совпадает. */
function buildShoppingItems(menu: GeneratedMenu, products: StoreProduct[]): ShoppingItem[] {
  const counts = new Map<number, number>();
  for (const day of menu.days) {
    for (const id of [day.breakfastId, day.lunchId, day.dinnerId]) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const storeProducts = products.filter(
    (item) => item.store_name === menu.store && item.in_stock !== false,
  );

  type Line = { names: string[]; grams: number; product?: StoreProduct };
  const lines = new Map<string, Line>();
  for (const [recipeId, times] of counts) {
    const meal = menu.recipes[recipeId];
    if (!meal) continue;
    for (const ingredient of meal.ingredients) {
      const product = matchProduct(ingredient.name, storeProducts);
      const key = product ? `p:${product.product_title}` : `n:${ingredient.name}`;
      const line = lines.get(key) ?? { names: [], grams: 0, product };
      if (!line.names.includes(ingredient.name)) line.names.push(ingredient.name);
      line.grams += ingredient.grams * times * (menu.portions ?? 1);
      lines.set(key, line);
    }
  }

  return [...lines.values()]
    .map(({ names, grams, product }): ShoppingItem => {
      const name = names.length === 1 ? names[0] : (product?.search_term ?? names[0]);
      const category = INGREDIENT_CATEGORY[name] ?? guessCategory(name);
      if (!product) {
        return { name, grams, category, price: Math.max(1, Math.round(grams * 0.15)), store: menu.store, packs: 0, packGrams: 0, packTitle: '' };
      }
      const packGrams = product.pack_weight_grams && product.pack_weight_grams > 0 ? product.pack_weight_grams : grams;
      const packs = Math.max(1, Math.ceil(grams / packGrams - 1e-9));
      return {
        name,
        grams,
        category,
        price: Math.round(packs * Number(product.price)),
        store: menu.store,
        packs,
        packGrams,
        packTitle: product.product_title,
      };
    })
    .sort((x, y) => x.name.localeCompare(y.name, 'ru'));
}

/** Среди совпадений по названию берёт самую дешёвую за грамм упаковку. */
function matchProduct(name: string, products: StoreProduct[]) {
  const needle = name.toLowerCase();
  const candidates = products.filter(
    (item) =>
      item.search_term.toLowerCase() === needle ||
      needle.includes(item.search_term.toLowerCase()) ||
      item.search_term.toLowerCase().includes(needle),
  );
  if (!candidates.length) return undefined;

  const perGram = (p: StoreProduct) => p.price / (p.pack_weight_grams && p.pack_weight_grams > 0 ? p.pack_weight_grams : 1);
  return candidates.reduce((best, cur) => (perGram(cur) < perGram(best) ? cur : best));
}

function guessCategory(name: string): ShoppingCategory {
  const lower = name.toLowerCase();
  if (/(яйц|молок|йогурт|сыр|творог|кефир|сливк|сметан|сливочн|моцарелл)/.test(lower)) return 'Молочные продукты';
  if (/(филе|курин|бёдр|крыл|фарш|мясо|говяд|свинин|индейк|ветчин|сосиск|лосос|сёмг|тунец|треск|минтай|кальмар|креветк)/.test(lower)) return 'Мясо и птица';
  if (/(ягод|овощ|перец|кабач|томат|помидор|морков|лук|брокколи|картоф|капуст|свёкл|тыкв|баклаж|гриб|шампин|огурц|шпинат|салат|руккол|чеснок|зелень|лимон|яблок|банан|авокадо)/.test(lower)) return 'Овощи и фрукты';
  return 'Бакалея';
}

function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((total, value) => total + (Number(value) || 0), 0);
}
