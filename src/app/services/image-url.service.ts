import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageUrlService {
  getOptimizedUrl(source: string | null | undefined, width: number, fallback = ''): string {
    const imageUrl = source || fallback;

    try {
      const url = new URL(imageUrl);
      if (url.hostname === 'images.unsplash.com') {
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        url.searchParams.set('q', '85');
        url.searchParams.set('w', String(width));
      } else if (url.hostname.endsWith('ticketm.net')) {
        url.pathname = url.pathname.replace(
          /_EVENT_DETAIL_PAGE_16_9(?=\.[^.]+$)/,
          '_RETINA_PORTRAIT_16_9'
        );
        url.pathname = url.pathname.replace(
          /_RECOMENDATION_16_9(?=\.[^.]+$)/,
          '_TABLET_LANDSCAPE_16_9'
        );
      } else if (url.hostname === 'cdn-images.dzcdn.net') {
        url.pathname = url.pathname.replace('/250x250-', '/1000x1000-');
      }
      return url.toString();
    } catch {
      return imageUrl;
    }
  }
}