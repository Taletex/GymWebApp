import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
  USERS = "users",
  PROFILES = "userprofile"
}

export class PageStatus {
  public trainings: string;
  public exercises: string;
  public users: string;
  public userprofile: string;

  constructor(trainings: string = PAGEMODE.READONLY, exercises: string = PAGEMODE.READONLY, users: string = PAGEMODE.READONLY, userprofile: string = PAGEMODE.READONLY) {
    this.trainings = trainings;
    this.exercises = exercises;
    this.users = users;
    this.userprofile = userprofile;
  }
} 

export enum NOTIFICATION_TYPE {
  COACH_REQUEST = "coach_request",
  ATHLETE_REQUEST = "athlete_request",
  REQUEST_SUCCESS = "request_success",
  REQUEST_REFUSE = "request_refuse",
  CANCEL_ATHLETE_TO_COACH_LINK = "cancel_athlete_to_coach_link",
  CANCEL_COACH_TO_ATHLETE_LINK = "cancel_coach_to_athlete_link",
  CANCEL_ATHLETE_TO_COACH_LINK_REQUEST = "cancel_athlete_to_coach_link_request",
  CANCEL_COACH_TO_ATHLETE_LINK_REQUEST = "cancel_coach_to_athlete_link_request",
  DISMISS = "dismiss"
}

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  
  public pageStatus: PageStatus;

  constructor(private router: Router) {
    this.initPageStatus();
    console.log(this.pageStatus);
  }

  openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.setPageStatus(mode, page);

    if(id)
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


