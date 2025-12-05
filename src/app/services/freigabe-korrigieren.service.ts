import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FreigabeKorrigierenService {

private listUrl="response_freigabe_korrigieren_list_1_.json"
private detailUrl="response_freigabe_korrigieren_detail_1_.json"
  constructor(private http :HttpClient) { }
  getFreigabe():Observable<any[]>{
    return this.http.get<any[]>(this.listUrl).pipe(
catchError(this.handelError)
    );
}
getFreigabeById(id:string):Observable<any>{
  return this.http.get<any>(this.detailUrl).pipe(
    catchError(this.handelError)
  )
}
private handelError(error : HttpErrorResponse){
  let userMessage='An unknown error occurred!'
  if(error.error instanceof ErrorEvent){
    console.log('Aclient side error ocurred :',error.error.message);
    userMessage=`network error :${error.error.message}`;
  }else{
    console.error(`Back end returned code ${error.status}, `+` body was:`,error.error);
    if(error.status===404){
      userMessage='The requested stempelzeit data could not be found (Error 404). Please check the file path.';
    }else if(error.status===500){
      userMessage='There was a server error (Error 500). Please try again later.';
    }else {
      userMessage=`Error :${error.statusText}(code:${error.status})`;
    }
  }
  return throwError(() => userMessage)
}}
