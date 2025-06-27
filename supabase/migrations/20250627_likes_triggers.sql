// For like
await supabase
  .from('components')
  .update({ likes_count: likesCount + 1 })
  .eq('id', component.id);

// For unlike
await supabase
  .from('components')
  .update({ likes_count: likesCount - 1 })
  .eq('id', component.id);

// For save
await supabase
  .from('components')
  .update({ saves_count: savesCount + 1 })
  .eq('id', component.id);

// For unsave
await supabase
  .from('components')
  .update({ saves_count: savesCount - 1 })
  .eq('id', component.id);