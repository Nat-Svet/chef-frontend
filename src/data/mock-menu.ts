import type { MealType } from '../lib/types';

export type MockIngredient = {
  name: string;
  grams: number;
};

export type MockMeal = {
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
  ingredients: MockIngredient[];
  steps: string[];
};

export const MOCK_BUDGET_LIMIT = 5000;
export const MOCK_SPENT = 1840;

export const MOCK_MEALS: MockMeal[] = [
  {
    id: 1,
    mealType: 'завтрак',
    title: 'Овсянка с ягодами и йогуртом',
    cookingTime: 12,
    kcal: 320,
    protein: 14,
    fat: 8,
    carb: 48,
    tags: ['ПП', 'Быстро', 'Плита'],
    equipment: 'Плита',
    emoji: '🥣',
    ingredients: [
      { name: 'Овсяные хлопья', grams: 50 },
      { name: 'Йогурт натуральный', grams: 120 },
      { name: 'Смесь ягод', grams: 80 },
      { name: 'Молоко 2,5%', grams: 100 },
      { name: 'Мёд', grams: 10 },
    ],
    steps: [
      'Всыпьте хлопья в сотейник и залейте молоком. Поставьте на средний огонь.',
      'Варите 5–7 минут, помешивая, пока каша не станет кремовой.',
      'Снимите с плиты, дайте минуту отдохнуть и переложите в тарелку.',
      'Сверху выложите йогурт и ягоды, полейте мёдом. Подавайте сразу.',
    ],
  },
  {
    id: 2,
    mealType: 'обед',
    title: 'Куриное филе с киноа и овощами',
    cookingTime: 25,
    kcal: 480,
    protein: 42,
    fat: 12,
    carb: 46,
    tags: ['ПП', 'Низкокалорийное', 'Плита'],
    equipment: 'Плита',
    emoji: '🍗',
    ingredients: [
      { name: 'Куриное филе', grams: 160 },
      { name: 'Киноа', grams: 60 },
      { name: 'Брокколи', grams: 100 },
      { name: 'Болгарский перец', grams: 80 },
      { name: 'Оливковое масло', grams: 8 },
      { name: 'Соль и специи', grams: 4 },
    ],
    steps: [
      'Промойте киноа и отварите в подсоленной воде 12–14 минут до мягкости. Откиньте на сито.',
      'Филе нарежьте медальонами, посолите и обжарьте на масле по 4 минуты с каждой стороны.',
      'Перец и брокколи быстро обжарьте или припустите на той же сковороде 3–4 минуты.',
      'Соберите тарелку: киноа, курица, овощи. Полейте соком со сковороды и подавайте.',
    ],
  },
  {
    id: 3,
    mealType: 'ужин',
    title: 'Овощное рагу в мультиварке',
    cookingTime: 40,
    kcal: 390,
    protein: 12,
    fat: 14,
    carb: 52,
    tags: ['ПП', 'Мультиварка', 'Вегетарианское'],
    equipment: 'Мультиварка',
    emoji: '🍲',
    ingredients: [
      { name: 'Кабачок', grams: 150 },
      { name: 'Помидоры', grams: 120 },
      { name: 'Морковь', grams: 80 },
      { name: 'Репчатый лук', grams: 60 },
      { name: 'Нут варёный', grams: 80 },
      { name: 'Оливковое масло', grams: 10 },
    ],
    steps: [
      'Нарежьте овощи крупными кубиками. Лук и морковь слегка обжарьте в чаше на режиме «Жарка».',
      'Добавьте кабачок, помидоры, нут, масло и щепотку соли. Перемешайте.',
      'Закройте крышку и готовьте 25 минут на режиме «Тушение».',
      'Дайте рагу 5 минут настояться, разложите по тарелкам и подавайте тёплым.',
    ],
  },
];

export const DAYS_IN_WEEK = 7;

export type ShoppingCategory = 'Овощи и фрукты' | 'Мясо и птица' | 'Молочные продукты' | 'Бакалея';

export type ShoppingItem = {
  name: string;
  grams: number;
  category: ShoppingCategory;
  price: number;
};

const CATEGORY_ORDER: ShoppingCategory[] = [
  'Овощи и фрукты',
  'Мясо и птица',
  'Молочные продукты',
  'Бакалея',
];

const INGREDIENT_META: Record<string, { category: ShoppingCategory; pricePer100g: number }> = {
  'Смесь ягод': { category: 'Овощи и фрукты', pricePer100g: 42 },
  Брокколи: { category: 'Овощи и фрукты', pricePer100g: 18 },
  'Болгарский перец': { category: 'Овощи и фрукты', pricePer100g: 22 },
  Кабачок: { category: 'Овощи и фрукты', pricePer100g: 12 },
  Помидоры: { category: 'Овощи и фрукты', pricePer100g: 16 },
  Морковь: { category: 'Овощи и фрукты', pricePer100g: 8 },
  'Репчатый лук': { category: 'Овощи и фрукты', pricePer100g: 7 },
  'Куриное филе': { category: 'Мясо и птица', pricePer100g: 48 },
  'Йогурт натуральный': { category: 'Молочные продукты', pricePer100g: 16 },
  'Молоко 2,5%': { category: 'Молочные продукты', pricePer100g: 9 },
  'Овсяные хлопья': { category: 'Бакалея', pricePer100g: 12 },
  Киноа: { category: 'Бакалея', pricePer100g: 32 },
  Мёд: { category: 'Бакалея', pricePer100g: 55 },
  'Оливковое масло': { category: 'Бакалея', pricePer100g: 70 },
  'Соль и специи': { category: 'Бакалея', pricePer100g: 40 },
  'Нут варёный': { category: 'Бакалея', pricePer100g: 18 },
};

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  'Овощи и фрукты': '🥦',
  'Мясо и птица': '🍗',
  'Молочные продукты': '🥛',
  Бакалея: '🫙',
};

/** Цель: корзина на 12% ниже недельного лимита — психологический запас. */
export const BUDGET_COMFORT_RATIO = 0.88;

export function buildWeeklyShoppingList(budgetLimit: number): ShoppingItem[] {
  const gramsByName = new Map<string, number>();

  for (const meal of MOCK_MEALS) {
    for (const ingredient of meal.ingredients) {
      gramsByName.set(
        ingredient.name,
        (gramsByName.get(ingredient.name) ?? 0) + ingredient.grams * DAYS_IN_WEEK,
      );
    }
  }

  const raw = [...gramsByName.entries()].map(([name, grams]) => {
    const meta = INGREDIENT_META[name] ?? { category: 'Бакалея' as const, pricePer100g: 15 };
    return {
      name,
      grams,
      category: meta.category,
      rawPrice: (grams / 100) * meta.pricePer100g,
    };
  });

  const rawTotal = raw.reduce((sum, item) => sum + item.rawPrice, 0) || 1;
  const target = Math.round(budgetLimit * BUDGET_COMFORT_RATIO);

  return raw
    .map((item) => ({
      name: item.name,
      grams: item.grams,
      category: item.category,
      price: Math.max(1, Math.round((item.rawPrice / rawTotal) * target)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function groupShoppingList(items: ShoppingItem[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    emoji: CATEGORY_EMOJI[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

export const MOCK_SHOPPING_LIST = buildWeeklyShoppingList(MOCK_BUDGET_LIMIT);

export function getMealById(id: string | string[] | undefined) {
  const key = Array.isArray(id) ? id[0] : id;
  return MOCK_MEALS.find((item) => String(item.id) === key);
}

export function formatGrams(gramsPerPortion: number, portions: number) {
  const value = gramsPerPortion * portions;
  if (value < 10) {
    return `${value.toFixed(1).replace('.', ',')} г`;
  }
  return `${Math.round(value)} г`;
}
