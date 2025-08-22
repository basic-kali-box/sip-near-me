import { useState, useEffect, useRef } from 'react';

interface ScrollDirectionOptions {
  threshold?: number;
  debounceMs?: number;
}

interface ScrollState {
  isScrollingDown: boolean;
  isScrollingUp: boolean;
  scrollY: number;
  isAtTop: boolean;
  shouldHideHeader: boolean;
}

export const useScrollDirection = (
  element?: HTMLElement | null,
  options: ScrollDirectionOptions = {}
): ScrollState => {
  const { threshold = 10, debounceMs = 100 } = options;
  
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrollingDown: false,
    isScrollingUp: false,
    scrollY: 0,
    isAtTop: true,
    shouldHideHeader: false,
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const targetElement = element || window;
    
    const updateScrollDirection = () => {
      const scrollY = element ? element.scrollTop : window.scrollY;
      const scrollDifference = scrollY - lastScrollY.current;
      const isAtTop = scrollY < threshold;

      // Only update if scroll difference is significant enough
      if (Math.abs(scrollDifference) < threshold && !isAtTop) {
        ticking.current = false;
        return;
      }

      const isScrollingDown = scrollDifference > 0 && scrollY > threshold;
      const isScrollingUp = scrollDifference < 0;
      
      // Determine if header should be hidden
      // Hide when scrolling down and not at top, show when scrolling up or at top
      // Add some hysteresis to prevent flickering
      const shouldHideHeader = isScrollingDown && scrollY > threshold * 2;

      setScrollState({
        isScrollingDown,
        isScrollingUp,
        scrollY,
        isAtTop,
        shouldHideHeader,
      });

      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (!ticking.current) {
          requestAnimationFrame(updateScrollDirection);
          ticking.current = true;
        }
      }, debounceMs);
    };

    // Add scroll listener
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Initial call to set state
    updateScrollDirection();

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [element, threshold, debounceMs]);

  return scrollState;
};
