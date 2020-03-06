import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* Usato per iniettare il service nell'app. Nota che 'root' serve per indicare che viene fornito al root level (AppModule).
*  Nota che cosi facendo si rende il service un singleton!
* */
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private url = 'https://super-crud.herokuapp.com/pokemon';

  constructor(private http: HttpClient) { }

  getPokemons(): Observable<any> {
    return this.http.get<any>(this.url);
  }
}
