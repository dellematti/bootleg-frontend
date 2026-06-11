import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch, withXsrfConfiguration } from '@angular/common/http';

import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { ssrCookieForwardInterceptor } from './interceptors/ssr-cookie.interceptor';


import { xsrfAbsoluteUrlInterceptor } from './interceptors/xsrf.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      }),

      withInterceptors([
        credentialsInterceptor,
        xsrfAbsoluteUrlInterceptor,
        ssrCookieForwardInterceptor

      ])
    )
  ]
};