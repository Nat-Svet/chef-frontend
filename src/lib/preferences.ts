export type UserPreferences = {
  complete: boolean;
  budgetLimit: number;
  dietTags: string[];
  equipmentTags: string[];
  selectedStores: string[];
  profileId: string | null;
  /** На сколько человек (порций) покупаем продукты. */
  portions: number;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  complete: false,
  budgetLimit: 5000,
  dietTags: [],
  equipmentTags: [],
  selectedStores: [],
  profileId: null,
  portions: 1,
};

export const PREFERENCES_STORAGE_KEY = 'chef.preferences.v1';
