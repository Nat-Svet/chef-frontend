export const STORES = ['Самокат', 'ВкусВилл', 'Пятерочка'] as const;

export const DIET_TAGS = ['ПП', 'Низкокалорийное', 'Быстро'] as const;

export const EQUIPMENT_TAGS = ['Плита', 'Духовка', 'Мультиварка'] as const;

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const DIET_OPTIONS = [
  { id: 'ПП', emoji: '🥗', hint: 'сбалансированные блюда' },
  { id: 'Низкокалорийное', emoji: '⚖️', hint: 'легче и стройнее' },
  { id: 'Быстро', emoji: '⚡', hint: 'до 20 минут' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { id: 'Плита', emoji: '🔥' },
  { id: 'Духовка', emoji: '🍞' },
  { id: 'Мультиварка', emoji: '🍲' },
] as const;

export const STORE_OPTIONS = [
  { id: 'Самокат', emoji: '🛴', hint: 'быстрая доставка' },
  { id: 'ВкусВилл', emoji: '🥦', hint: 'здоровые продукты' },
  { id: 'Пятерочка', emoji: '🛒', hint: 'рядом с домом' },
] as const;
