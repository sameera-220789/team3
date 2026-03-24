export const getEmoji = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'food': return '🍔';
    case 'travel': return '🚕';
    case 'shopping': return '🛍️';
    case 'bills': return '📄';
    case 'entertainment': return '🎬';
    case 'healthcare': return '🏥';
    case 'education': return '📚';
    case 'income': return '💰';
    case 'salary': return '💵';
    case 'rent': return '🏠';
    case 'insurance': return '🛡️';
    case 'subscriptions': return '📺';
    default: return '💼';
  }
};
