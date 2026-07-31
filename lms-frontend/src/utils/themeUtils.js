export const THEME_CONFIGS = {
  purple: {
    id: 'purple',
    name: 'Purple',
    primary: '#7C3AED',
    secondary: '#6366F1',
    gradient: 'linear-gradient(90deg, #6366F1, #7C3AED)',
    lightBg: '#F5F3FF',
    lightBorder: '#DDD6FE',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    activeToggle: 'bg-purple-600',
    swatchBg: 'bg-purple-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    primary: '#059669',
    secondary: '#10B981',
    gradient: 'linear-gradient(90deg, #10B981, #059669)',
    lightBg: '#ECFDF5',
    lightBorder: '#A7F3D0',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeToggle: 'bg-emerald-600',
    swatchBg: 'bg-emerald-600',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    primary: '#2563EB',
    secondary: '#3B82F6',
    gradient: 'linear-gradient(90deg, #3B82F6, #2563EB)',
    lightBg: '#EFF6FF',
    lightBorder: '#BFDBFE',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    activeToggle: 'bg-blue-600',
    swatchBg: 'bg-blue-600',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    primary: '#EA580C',
    secondary: '#F97316',
    gradient: 'linear-gradient(90deg, #F97316, #EA580C)',
    lightBg: '#FFF7ED',
    lightBorder: '#FED7AA',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    activeToggle: 'bg-orange-600',
    swatchBg: 'bg-orange-600',
  },
};

export const applyAppTheme = (themeId = 'purple') => {
  const theme = THEME_CONFIGS[themeId] || THEME_CONFIGS.purple;
  const root = document.documentElement;

  root.style.setProperty('--color-brand-primary', theme.primary);
  root.style.setProperty('--color-brand-secondary', theme.secondary);
  root.style.setProperty('--color-brand-gradient', theme.gradient);
  root.style.setProperty('--color-brand-light-bg', theme.lightBg);
  root.style.setProperty('--color-brand-light-border', theme.lightBorder);
  root.setAttribute('data-theme', theme.id);
};
