/** Типы под таблицы Supabase: profiles, recipes, recipe_ingredients, store_products */

export type MealType = 'завтрак' | 'обед' | 'ужин';

export type Profile = {
  id: string;
  updated_at: string;
  budget_limit: number;
  selected_stores: string[];
  diet_tags: string[];
  equipment_tags: string[];
};

export type Recipe = {
  id: number;
  title: string;
  instructions: string | null;
  image_url: string | null;
  cooking_time: number | null;
  meal_type: MealType | null;
  tags: string[];
};

export type RecipeIngredient = {
  id: number;
  recipe_id: number;
  name: string;
  amount_grams: number | null;
  kcal: number | null;
  protein: number | null;
  fat: number | null;
  carb: number | null;
};

export type StoreProduct = {
  id: number;
  store_name: string;
  search_term: string;
  product_title: string;
  price: number;
  sku_id: string;
  pack_weight_grams: number | null;
  in_stock: boolean;
};
