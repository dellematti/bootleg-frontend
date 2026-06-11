/*
import { isPlatformServer } from '@angular/common';
import {
  HttpContextToken,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

export const FORWARD_BROWSER_COOKIES = new HttpContextToken<boolean>(() => false);

export const ssrCookieForwardInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const incomingRequest = inject(REQUEST, { optional: true });

  const shouldForwardCookies = req.context.get(FORWARD_BROWSER_COOKIES);

  if (!isPlatformServer(platformId) || !shouldForwardCookies || !incomingRequest) {
    return next(req);
  }

  const cookieHeader = incomingRequest.headers.get('cookie');
  if (!cookieHeader) {
    return next(req);
  }

  // opzionale: limita l’inoltro solo alle chiamate verso il tuo backend auth/api
  const isBackendCall =
    req.url.startsWith('http://localhost:8080') ||
    req.url.startsWith('/auth') ||
    req.url.startsWith('/api');

  if (!isBackendCall) {
    return next(req);
  }

  const cloned = req.clone({
    withCredentials: true,
    headers: req.headers.set('Cookie', cookieHeader)
  });

  return next(cloned);
};
*/

// versione con log per debug

import { isPlatformServer } from '@angular/common';
import {
  HttpContextToken,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

export const FORWARD_BROWSER_COOKIES = new HttpContextToken<boolean>(() => false);

export const ssrCookieForwardInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const incomingRequest = inject(REQUEST, { optional: true });

  const shouldForwardCookies = req.context.get(FORWARD_BROWSER_COOKIES);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  console.log('[SSR] Richiesta HttpClient:', req.url);
  console.log('[SSR] shouldForwardCookies:', shouldForwardCookies);
  console.log('[SSR] incomingRequest presente:', !!incomingRequest);

  if (!shouldForwardCookies || !incomingRequest) {
    console.log('[SSR] Forwarding cookie NON eseguito');
    return next(req);
  }

  const cookieHeader = incomingRequest.headers.get('cookie');
  console.log('[SSR] Cookie ricevuto dal browser:', cookieHeader);

  if (!cookieHeader) {
    console.log('[SSR] Nessun cookie presente nella richiesta SSR');
    return next(req);
  }

  const isBackendCall = req.url.startsWith('http://localhost:8080');

  if (!isBackendCall) {
    console.log('[SSR] Non è chiamata backend');
    return next(req);
  }

  console.log('[SSR] Inoltro cookie al backend');

  const cloned = req.clone({
    withCredentials: true,
    headers: req.headers.set('Cookie', cookieHeader)
  });

  return next(cloned);
};




