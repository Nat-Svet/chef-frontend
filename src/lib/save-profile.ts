import { supabase } from '@/lib/supabase';

export type ProfilePayload = {
  budgetLimit: number;
  selectedStores: string[];
  dietTags: string[];
  equipmentTags: string[];
};

async function resolveProfileId(existingProfileId?: string | null): Promise<string> {
  if (existingProfileId) return existingProfileId;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id) return sessionData.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Не удалось создать анонимную сессию Supabase');

  return data.user.id;
}

/** Пишет онбординг в profiles. Не создаёт нового Auth-пользователя, если профиль уже есть. */
export async function upsertGuestProfile(
  payload: ProfilePayload,
  existingProfileId?: string | null,
): Promise<string> {
  const profileId = await resolveProfileId(existingProfileId);

  const { error } = await supabase.from('profiles').upsert(
    {
      id: profileId,
      budget_limit: payload.budgetLimit,
      selected_stores: payload.selectedStores,
      diet_tags: payload.dietTags,
      equipment_tags: payload.equipmentTags,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw new Error(error.message);
  }

  return profileId;
}
