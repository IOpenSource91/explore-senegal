'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getThemeById, themeToCSSVars } from '@/lib/themes';

function applyTheme(themeId: string) {
  const theme = getThemeById(themeId);
  const vars = themeToCSSVars(theme);
  const root = document.documentElement;

  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }
}

export default function ThemeProvider() {
  useEffect(() => {
    const supabase = createClient();

    async function loadTheme() {
      const { data } = await supabase
        .from('site_settings')
        .select('theme')
        .eq('id', 'default')
        .single();

      if (data?.theme) {
        applyTheme(data.theme);
      }
    }

    loadTheme();
  }, []);

  return null;
}
