import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const THEME_OPTIONS = [
  { value: 'black-gold', label: 'Black & Gold', description: 'Premium black and gold' },
  { value: 'cyber-night', label: 'Cyber Night', description: 'Dark purple/pink cyberpunk' },
  { value: 'sakura-blossom', label: 'Sakura Blossom', description: 'Soft pink Japanese spring' },
  { value: 'neon-arcade', label: 'Neon Arcade', description: 'Bright neons on black' },
  { value: 'ocean-depths', label: 'Ocean Depths', description: 'Deep blues and teals' },
  { value: 'sunset-blaze', label: 'Sunset Blaze', description: 'Warm oranges and golds' },
  { value: 'mecha-steel', label: 'Mecha Steel', description: 'Industrial grays and blue' },
  { value: 'dragon-festival', label: 'Dragon Festival', description: 'Rich reds and golds' },
  { value: 'spirit-garden', label: 'Spirit Garden', description: 'Soft greens, Ghibli nature' },
  { value: 'midnight-galaxy', label: 'Midnight Galaxy', description: 'Space purples and blues' },
  { value: 'snow-kingdom', label: 'Snow Kingdom', description: 'Clean whites and icy blues' },
] as const;

export type ThemeName = typeof THEME_OPTIONS[number]['value'];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'black-gold',
  setTheme: () => { },
  isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('black-gold');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch theme from site_settings on mount
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('theme')
          .limit(1)
          .single();

        if (!error && data?.theme) {
          const validTheme = THEME_OPTIONS.find(t => t.value === data.theme);
          if (validTheme) {
            setThemeState(validTheme.value);
          }
        }
      } catch {
        // Fall back to default theme
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();

    // Subscribe to realtime changes on site_settings
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          const newTheme = payload.new?.theme;
          if (newTheme) {
            const validTheme = THEME_OPTIONS.find(t => t.value === newTheme);
            if (validTheme) {
              setThemeState(validTheme.value);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply theme to document element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}
