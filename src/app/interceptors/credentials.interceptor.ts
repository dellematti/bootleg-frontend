import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith('http://localhost:8080');

  if (!isApiRequest) {
    return next(req);
  }

  return next(req.clone({
    withCredentials: true
  }));
};