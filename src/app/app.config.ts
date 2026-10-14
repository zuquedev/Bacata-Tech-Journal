import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),   // HttpClient para pedir data/noticias.json
    provideRouter(
      routes,
      withComponentInputBinding(),                                   // :id y ?volver llegan como input()
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),   // cada página empieza arriba
    ),
  ],
};
