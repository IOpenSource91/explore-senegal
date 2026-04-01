'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from '@/i18n/routing';

export function AdminRouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');

      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');

      if (!href || href.startsWith('#')) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (
        nextUrl.origin !== currentUrl.origin ||
        `${nextUrl.pathname}${nextUrl.search}` ===
          `${currentUrl.pathname}${currentUrl.search}`
      ) {
        return;
      }

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      setVisible(true);
    };

    const handleFinish = () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 220);
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('pageshow', handleFinish);
    window.addEventListener('popstate', handleFinish);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('pageshow', handleFinish);
      window.removeEventListener('popstate', handleFinish);

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 220);
  }, [pathname, visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="admin-route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-none absolute inset-x-0 top-0 z-40 h-3"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-primary/10" />
          <motion.div
            className="absolute top-0 h-[3px] w-[28%] rounded-full bg-[linear-gradient(90deg,rgba(156,61,0,0),rgba(156,61,0,0.45),rgba(254,178,52,0.95),rgba(156,61,0,0.55),rgba(156,61,0,0))] shadow-[0_4px_18px_-8px_rgba(156,61,0,0.55)]"
            initial={{ left: '-30%' }}
            animate={{ left: ['-30%', '18%', '52%', '100%'] }}
            transition={{
              duration: 1.05,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
