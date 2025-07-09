// lib/userStats.ts
import { supabase } from './supabase';

export const incrementPhotosTaken = async (userId: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('photos_taken')
      .eq('id', userId)
      .single();

    if (fetchError || !data) {
      console.error('Failed to fetch photos_taken count:', fetchError);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photos_taken: (data.photos_taken || 0) + 1 })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update photos_taken count:', updateError);
    }
  } catch (err) {
    console.error('Unexpected error incrementing photos_taken:', err);
  }
};
