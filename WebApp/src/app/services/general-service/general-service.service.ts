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

export class PageStatus {
  public trainings: string;
  public exercises: string;
  public users: string;

  constructor(trainings: string = PAGEMODE.WRITE, exercises: string = PAGEMODE.WRITE, users: string = PAGEMODE.WRITE) {
    this.trainings = trainings;
    this.exercises = exercises;
    this.users = users;
  }
} 

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  
  public pageStatus: PageStatus; //= { trainings: PAGEMODE.WRITE, exercises: PAGEMODE.WRITE, users: PAGEMODE.WRITE };

  constructor(private router: Router) {
    this.initPageStatus();
    console.log(this.pageStatus);
  }

  openPageWithMode(mode: PAGEMODE, page: PAGES, id: string) {
    this.setPageStatus(mode, page);

    if(id != null || id != '')
      this.router.navigate([page, id]);
    else
      this.router.navigate([page]);

    return;
  }

  initPageStatus() {
    if (typeof(Storage) !== "undefined") {
      if(!sessionStorage.pageStatus) 
        sessionStorage.pageStatus = JSON.stringify(new PageStatus());

      this.pageStatus = JSON.parse(sessionStorage.pageStatus);
    } else {
      this.pageStatus = new PageStatus();
    }
  }

  setPageStatus(mode: PAGEMODE, page: PAGES) {
    this.pageStatus[page] = mode;
    if (typeof(Storage) !== "undefined") 
      sessionStorage.pageStatus = JSON.stringify(this.pageStatus);
  }

  getPageStatus():PageStatus {
    return this.pageStatus;
  }

}


