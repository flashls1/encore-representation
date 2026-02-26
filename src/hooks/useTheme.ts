import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useData';

const THEMES = [
    'neon-nights', 'sakura', 'cyberpunk', 'ocean-wave', 'retro-arcade',
    'forest-shrine', 'sunset-horizon', 'midnight-galaxy', 'volcanic', 'frost-crystal',
] as const;

export type ThemeName = (typeof THEMES)[number];

export const useTheme = () => {
    const { data: settings } = useSiteSettings();
    const currentTheme = (settings?.theme as ThemeName) || 'neon-nights';

    useEffect(() => {
        document.documentElement.dataset.theme = currentTheme;
    }, [currentTheme]);

    return { currentTheme, availableThemes: THEMES };
};
