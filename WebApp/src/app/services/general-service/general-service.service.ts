import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum PAGEMODE{
  READONLY = "readonly",
  WRITE = "write",
  STATS = "stats"
}

export enum PAGES {
  TRAININGS = "trainings",
  EXERCISES = "exercises",
  USERS = "users"
}

/* export class PageStatus {
  public trainings: string;
  public exercises: string;
  public users: string;

  constructor(trainings: string = PAGEMODE.WRITE, exercises: string = PAGEMODE.WRITE, users: string = PAGEMODE.WRITE) {
    this.trainings = trainings;
    this.exercises = exercises;
    this.users = users;
  }
} */

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  
  public pageStatus = { trainings: PAGEMODE.WRITE, exercises: PAGEMODE.WRITE, users: PAGEMODE.WRITE };

  constructor(private router: Router) { }

  openPageWithMode(mode: string, page: string, id: string) {
    this.pageStatus[page] = mode;

    if(id != null || id != '')
      this.router.navigate([page, id]);
    else
      this.router.navigate([page]);

    return;
  }
}


