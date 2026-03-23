import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type TransitionType = 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down' | 'fade' | 'zoom';

export function navigateWithTransition(
  router: AppRouterInstance,
  path: string,
  transition: TransitionType = 'fade'
) {
  if (typeof document === 'undefined') {
    router.push(path);
    return;
  }

  const root = document.documentElement;
  root.dataset.transition = transition;

  if ('startViewTransition' in document) {
    (document as any).startViewTransition(() => {
      router.push(path);
    });
  } else {
    router.push(path);
  }
}
