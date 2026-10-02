import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { WeekDay } from '@/constants/catalog';
import { usePreferences } from '@/hooks/use-preferences';
import { generateMenuOnServer, regenerateMealOnServer } from '@/lib/api';
import { applyPortions, hydrateGeneratedMenu, swapMeal, type GeneratedMenu, type Meal } from '@/lib/menu';
import type { MealType } from '@/lib/types';

const MENU_STORAGE_KEY = 'chef.generated-menu.v1';

type MenuContextValue = {
  ready: boolean;
  menu: GeneratedMenu | null;
  generating: boolean;
  error: string | null;
  regeneratingSlot: string | null;
  generateMenu: (userId: string) => Promise<void>;
  clearMenu: () => Promise<void>;
  getMealById: (id: string | string[] | undefined) => Meal | undefined;
  regenerateMeal: (day: WeekDay, mealType: MealType) => Promise<void>;
  portions: number;
  setPortions: (count: number) => Promise<void>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { preferences, savePreferences } = usePreferences();
  const portions = preferences.portions ?? 1;
  const portionsRequest = useRef(0);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState<GeneratedMenu | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingSlot, setRegeneratingSlot] = useState<string | null>(null);
  const inflight = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(MENU_STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        setMenu(JSON.parse(raw) as GeneratedMenu);
      })
      .catch(() => {
        /* оставляем пустое меню */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const generateMenu = useCallback(async (userId: string) => {
    if (inflight.current) return;
    inflight.current = true;
    setGenerating(true);
    setError(null);

    try {
      const response = await generateMenuOnServer(userId, portions);
      const next = await hydrateGeneratedMenu(response.userId, response.menu, response.isFallback, portions);
      setMenu(next);
      await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(next));
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : 'Не удалось собрать рацион';
      const message =
        /failed to fetch|networkerror|load failed/i.test(raw)
          ? 'Не удалось связаться с сервером. Проверьте соединение и нажмите «Попробовать снова».'
          : raw;
      setError(message);
    } finally {
      setGenerating(false);
      inflight.current = false;
    }
  }, [portions]);

  const clearMenu = useCallback(async () => {
    setMenu(null);
    setError(null);
    await AsyncStorage.removeItem(MENU_STORAGE_KEY);
  }, []);

  const getMealById = useCallback(
    (id: string | string[] | undefined) => {
      const key = Array.isArray(id) ? id[0] : id;
      if (!key || !menu) return undefined;
      return menu.recipes[Number(key)];
    },
    [menu],
  );

  const regenerateMeal = useCallback(
    async (day: WeekDay, mealType: MealType) => {
      if (!menu) return;
      const slotKey = `${day}-${mealType}`;
      setRegeneratingSlot(slotKey);
      try {
        const excludeIds = [...new Set(menu.days.flatMap((row) => [row.breakfastId, row.lunchId, row.dinnerId]))];
        const row = menu.days.find((item) => item.day === day);
        const key = mealType === 'завтрак' ? 'breakfastId' : mealType === 'обед' ? 'lunchId' : 'dinnerId';
        const currentId = row?.[key];
        const siblingIds = row
          ? [row.breakfastId, row.lunchId, row.dinnerId].filter((id) => id !== currentId)
          : [];
        // отвергнутые ранее + текущее блюдо, которое пользователь отвергает сейчас
        const rejectedIds = [...new Set([...(menu.rejectedIds ?? []), ...(currentId === undefined ? [] : [currentId])])];
        const { recipeId } = await regenerateMealOnServer(menu.userId, mealType, excludeIds, rejectedIds, siblingIds);
        const next = await swapMeal(menu, day, mealType, recipeId);
        setMenu(next);
        await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(next));
      } finally {
        setRegeneratingSlot(null);
      }
    },
    [menu],
  );

  const setPortions = useCallback(
    async (count: number) => {
      const next = Math.min(20, Math.max(1, Math.round(count)));
      const request = ++portionsRequest.current;
      await savePreferences({ ...preferences, portions: next });
      if (!menu) return;
      const updated = await applyPortions(menu, next);
      if (request !== portionsRequest.current) return; // пришёл более свежий клик
      setMenu(updated);
      await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(updated));
    },
    [menu, preferences, savePreferences],
  );

  const value = useMemo(
    () => ({ ready, menu, generating, error, regeneratingSlot, generateMenu, clearMenu, getMealById, regenerateMeal, portions, setPortions }),
    [ready, menu, generating, error, regeneratingSlot, generateMenu, clearMenu, getMealById, regenerateMeal, portions, setPortions],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu нужно вызывать внутри MenuProvider');
  }
  return context;
}
