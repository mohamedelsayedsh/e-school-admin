import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth";

export const authInterceptor : HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  if(token){
    const cloneRequest = req.clone({
      setHeaders: {
        Authorization: `bearer ${token}`
      }
    });
    return next(cloneRequest);
  }
  return next(req);
}
