export const STORES = ['Самокат', 'ВкусВилл', 'Пятерочка'] as const;

export const DIET_TAGS = ['ПП', 'Низкокалорийное', 'Быстро', 'Сытное', 'Семейное', 'Вегетарианское'] as const;

export const EQUIPMENT_TAGS = ['Плита', 'Духовка', 'Мультиварка'] as const;

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

/** id — тег рецепта в базе (по нему идёт строгая фильтрация), label — подпись в интерфейсе. */
export const DIET_OPTIONS = [
  { id: 'ПП', label: 'ПП', emoji: '🥗', hint: 'сбалансированные блюда' },
  { id: 'Низкокалорийное', label: 'Низкокалорийное', emoji: '⚖️', hint: 'легче и стройнее' },
  { id: 'Быстро', label: 'Быстро', emoji: '⚡', hint: 'до 20 минут' },
  {
    id: 'Сытное',
    label: 'Сытно и вкусно',
    emoji: '🥩',
    hint: 'Понятные, мясные и сытные блюда, чтобы плотно поесть и зарядиться энергией',
  },
  {
    id: 'Семейное',
    label: 'Семейное меню',
    emoji: '🧸',
    hint: 'Простые рецепты, которые с удовольствием едят и взрослые, и дети',
  },
  {
    id: 'Вегетарианское',
    label: 'Вегетарианское / Постное',
    emoji: '🥦',
    hint: 'Рацион без мяса и рыбы с идеальным балансом растительного белка',
  },
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
