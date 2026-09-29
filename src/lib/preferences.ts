export type UserPreferences = {
  complete: boolean;
  budgetLimit: number;
  dietTags: string[];
  equipmentTags: string[];
  selectedStores: string[];
  profileId: string | null;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  complete: false,
  budgetLimit: 5000,
  dietTags: [],
  equipmentTags: [],
  selectedStores: [],
  profileId: null,
};

export const PREFERENCES_STORAGE_KEY = 'chef.preferences.v1';
