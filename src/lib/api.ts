const TIMEWEB_API_URL = (process.env.EXPO_PUBLIC_TIMEWEB_API_URL ?? '').replace(/\/$/, '');

export type TimewebMenuDay = {
  day: string;
  breakfastId: number;
  lunchId: number;
  dinnerId: number;
};

export type TimewebMenu = {
  store: string;
  stores: string[];
  totalCost: number;
  nutrition: { kcal: number; protein: number; fat: number; carb: number } | null;
  zeroWasteNotes: string;
  scarcityNotice: string | null;
  days: TimewebMenuDay[];
};

export type GenerateMenuResponse = {
  userId: string;
  model: string;
  isFallback: boolean;
  menu: TimewebMenu;
};

export function getTimewebApiUrl() {
  return TIMEWEB_API_URL;
}

export async function generateMenuOnServer(userId: string): Promise<GenerateMenuResponse> {
  if (!TIMEWEB_API_URL) {
    throw new Error('Задайте EXPO_PUBLIC_TIMEWEB_API_URL в файле .env');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const response = await fetch(`${TIMEWEB_API_URL}/api/generate-menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as GenerateMenuResponse & {
      error?: string;
      details?: string;
    };

    if (!response.ok) {
      throw new Error(payload.details || payload.error || `Сервер ответил ${response.status}`);
    }

    if (!payload.menu?.days?.length) {
      throw new Error('Сервер вернул пустое меню');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Сервер слишком долго отвечает. Попробуйте ещё раз.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function regenerateMealOnServer(
  userId: string,
  mealType: 'завтрак' | 'обед' | 'ужин',
  excludeIds: number[],
): Promise<{ recipeId: number }> {
  if (!TIMEWEB_API_URL) {
    throw new Error('Задайте EXPO_PUBLIC_TIMEWEB_API_URL в файле .env');
  }

  const response = await fetch(`${TIMEWEB_API_URL}/api/regenerate-meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, mealType, excludeIds }),
  });

  const payload = (await response.json().catch(() => ({}))) as { recipeId?: number; error?: string };

  if (!response.ok || typeof payload.recipeId !== 'number') {
    throw new Error(payload.error || `Сервер ответил ${response.status}`);
  }

  return { recipeId: payload.recipeId };
}
