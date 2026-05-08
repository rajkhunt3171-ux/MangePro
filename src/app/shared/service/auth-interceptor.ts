import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Public routes jene token ni jarur nathi
  const publicUrls = ['/auth/login'];

  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
    return next(clonedReq);
  }
  return next(req);
};
