import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Training, Exercise, User } from '@app/_models/training-model';
import * as configs from 'configs.json';

// Usato per iniettare il service nell'app. Nota che 'root' serve per indicare che viene fornito al root level (AppModule). Nota che cosi facendo si rende il service un singleton!
@Injectable({
  providedIn: 'root'
})

// Doc: https://angular.io/guide/http
export class HttpService {

  public baseServerUrl;

  constructor(private http: HttpClient) {
    this.baseServerUrl = ((configs as any).default).nodeserver.address;
  }

  getDefaultOptions() {
    return { observe: 'body', responseType: 'json' };
  }

  /* TRAININGS CRUD */
  getTrainings(): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/trainings");
  }

  /* deleteTrainings(): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/trainings");
  } */

  /* TRAINING CRUD */
  createTraining(training: any): Observable<any> {
    return this.http.post<any>(this.baseServerUrl + "/trainings", training);
  }

  getTraining(id: string): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/trainings/" + id);
  }

  updateTraining(id: string, training: any): Observable<any> {
    return this.http.put<any>(this.baseServerUrl + "/trainings/" + id, training);
  }

  deleteTraining(id: string): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/trainings/" + id);
  }

  /* EXERCISES CRUD */
  getExercises(): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/exercises");
  }

  /* deleteExercises(): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/exercises");
  } */

  /* EXERCISE CRUD */
  createExercise(exercise: Exercise): Observable<any> {
    return this.http.post<any>(this.baseServerUrl + "/exercises", exercise);
  }

  getExercise(id: string): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/exercises/" + id);
  }

  updateExercise(id: string, exercise: any): Observable<any> {
    return this.http.put<any>(this.baseServerUrl + "/exercises/" + id, exercise);
  }

  deleteExercise(id: string): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/exercises/" + id);
  }

  /* USERS CRUD */
  getUsers(): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/users");
  }

  deleteUsers(): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/users");
  }

  getAthletes(): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/users/athletes");
  }

  /* USER CRUD */
  createUser(user: User): Observable<any> {
    return this.http.post<any>(this.baseServerUrl + "/users", user);
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(this.baseServerUrl + "/users/" + id);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(this.baseServerUrl + "/users/" + id, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(this.baseServerUrl + "/users/" + id);
  }
}
