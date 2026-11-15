export function getUserDisplayName(user) {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();

  const username = typeof user?.email === 'string' ? user.email.split('@')[0].trim() : '';
  return username || null;
}

export function getDashboardGreeting(user) {
  const displayName = getUserDisplayName(user);
  return displayName ? `Good morning, ${displayName}` : 'Good morning, friend';
}
