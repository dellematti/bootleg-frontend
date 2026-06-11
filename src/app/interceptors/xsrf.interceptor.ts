import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

function readCookie(doc: Document, name: string): string | null {
  const cookieString = doc.cookie || '';

  if (!cookieString) {
    return null;
  }

  const cookies = cookieString.split('; ');

  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split('=');

    if (cookieName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export const xsrfAbsoluteUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const documentRef = inject(DOCUMENT);

  // Solo browser
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    req.method.toUpperCase()
  );

  const isBackendCall = req.url.startsWith('http://localhost:8080');

  // Evita di mettere l'header sulla chiamata che serve a ottenere il token stesso
  const isCsrfBootstrapCall = req.url.startsWith('http://localhost:8080/auth/csrf');

  if (!isMutatingMethod || !isBackendCall || isCsrfBootstrapCall) {
    return next(req);
  }

  const xsrfToken = readCookie(documentRef, 'XSRF-TOKEN');

  if (!xsrfToken) {
    return next(req);
  }

  return next(
    req.clone({
      headers: req.headers.set('X-XSRF-TOKEN', xsrfToken)
    })
  );
};
