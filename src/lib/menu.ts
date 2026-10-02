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
  days: { day: WeekDay; breakfastId: number; lunchId: number; dinnerId: number }[];
  recipes: Record<number, Meal>;
  shoppingItems: ShoppingItem[];
};

export type ShoppingCategory = 'Овощи и фрукты' | 'Мясо и птица' | 'Молочные продукты' | 'Бакалея';

export type ShoppingItem = {
  name: string;
  grams: number;
  category: ShoppingCategory;
  price: number;
  store: string;
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

export function formatGrams(gramsPerPortion: number, portions: number) {
  const value = gramsPerPortion * portions;
  if (value < 10) {
    return `${value.toFixed(1).replace('.', ',')} г`;
  }
  return `${Math.round(value)} г`;
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

/** Меняет число порций и пересчитывает вес/стоимость всей корзины. */
export async function applyPortions(menu: GeneratedMenu, portions: number): Promise<GeneratedMenu> {
  const { data: products, error } = await supabase.from('store_products').select('*');
  if (error) throw error;

  const next: GeneratedMenu = { ...menu, portions, shoppingItems: [] };
  next.shoppingItems = buildShoppingItems(next, (products ?? []) as StoreProduct[]);
  next.totalCost = next.shoppingItems.reduce((sum, item) => sum + item.price, 0);
  return next;
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

function buildShoppingItems(menu: GeneratedMenu, products: StoreProduct[]): ShoppingItem[] {
  const counts = new Map<number, number>();
  for (const day of menu.days) {
    for (const id of [day.breakfastId, day.lunchId, day.dinnerId]) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const gramsByName = new Map<string, number>();
  for (const [recipeId, times] of counts) {
    const meal = menu.recipes[recipeId];
    if (!meal) continue;
    for (const ingredient of meal.ingredients) {
      gramsByName.set(ingredient.name, (gramsByName.get(ingredient.name) ?? 0) + ingredient.grams * times * (menu.portions ?? 1));
    }
  }

  const storeProducts = products.filter(
    (item) => item.store_name === menu.store && item.in_stock !== false,
  );

  const raw = [...gramsByName.entries()].map(([name, grams]) => {
    const product = matchProduct(name, storeProducts);
    const packGrams = product?.pack_weight_grams && product.pack_weight_grams > 0 ? product.pack_weight_grams : grams;
    const packs = product ? Math.max(1, Math.ceil(grams / packGrams)) : 1;
    const rawPrice = product ? packs * Number(product.price) : Math.max(1, Math.round(grams * 0.15));

    return {
      name,
      grams,
      category: INGREDIENT_CATEGORY[name] ?? guessCategory(name),
      rawPrice,
      store: menu.store,
    };
  });

  // Цены — ровно по каталогу выбранного магазина, без подгонки под бюджет.
  const items = raw
    .map((item) => ({
      name: item.name,
      grams: item.grams,
      category: item.category,
      store: item.store,
      price: item.rawPrice,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  return items;
}

/** Среди совпадений по названию (возможно, в разных магазинах) берёт самый
 *  дешёвый за грамм — так Закупщик реально оптимизирует корзину по выгоде. */
function matchProduct(name: string, products: StoreProduct[]) {
  const needle = name.toLowerCase();
  const candidates = products.filter(
    (item) =>
      item.search_term.toLowerCase() === needle ||
      needle.includes(item.search_term.toLowerCase()) ||
      item.search_term.toLowerCase().includes(needle),
  );
  if (!candidates.length) return undefined;

  return candidates.reduce((best, cur) => {
    const bestPerGram = best.price / (best.pack_weight_grams && best.pack_weight_grams > 0 ? best.pack_weight_grams : 1);
    const curPerGram = cur.price / (cur.pack_weight_grams && cur.pack_weight_grams > 0 ? cur.pack_weight_grams : 1);
    return curPerGram < bestPerGram ? cur : best;
  });
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
