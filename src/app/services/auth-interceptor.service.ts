import { Injectable } from '@angular/core';


 
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
 

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService  implements HttpInterceptor{

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

  //  console.log('intercept', req);

    const userToken = 'secure-user-token';
    const modifiedReq = req.clone({ 
      headers: req.headers.set('X-AUTHENTICATE-userId', `terab01@bmi.gv.at`),
    });
    return next.handle(modifiedReq);
  }
}
