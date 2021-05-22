import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MESSAGES } from '@app/_helpers';
import { Account } from '@app/_models';
import { Notification, User } from '@app/_models/training-model';
import { NOTIFICATION_TYPE } from '@app/_services/general-service/general-service.service';
import { HttpService } from '@app/_services/http-service/http-service.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public USER_VALIDATIONS: any = {MAX_PROFILE_PICTURE_NUMBER: 1, MAX_PROFILE_PICTURE_SIZE: 2, PROFILE_PICTURE_ACCEPTED_FORMATS: ['.jpg', '.jpeg', '.png'], MAX_BIOGRAPHY_LENGTH: 1000, MAX_NAME_LENGTH: 30, MAX_SURNAME_LENGTH: 30, 
                                  MIN_DATE: '1900-01-01T00:00', MAX_DATE: new Date(), MAX_GENERIC_RESIDENCE_FIELD_LENGTH: 100, MAX_CAP_LENGTH: 5, MAX_ADDRESS_LENGTH: 200, MIN_WEIGHT: 1, MAX_WEIGHT: 500, MIN_EXPERIENCE: 0, MAX_EXPERIENCE: 99, 
                                  MAX_GENERIC_CONTACT_LENGTH: 100, MAX_EMAIL_LENGTH: 100, MAX_TELEPHONE_LENGTH: 15, MAX_PSW_LENGTH: 50};
  public TRAINING_VALIDATIONS: any = {MAX_SESSION_NAME_LENGTH: 50, MAX_SESSION_COMMENT_LENGTH: 100, MAX_SERIES_NUMBER: 99999, MIN_SERIES_NUMBER: 1, MAX_REP_NUMBER: 99999, MIN_REP_NUMBER: 1, MAX_WEIGHT_NUMBER: 99999, MIN_WEIGHT_NUMBER: 0, 
                                      MAX_REST_TIME: 99999, MIN_REST_TIME: 0, MAX_DATE: "2100-01-01T00:00", MAX_WEEK_COMMENT_LENGTH: 500, MAX_TRAINING_COMMENT_LENGTH: 1000};


  constructor(private httpService: HttpService) { }


  /* === CHECK FUNCTIONS === */ 

  isCoachInUser(coach: User, account: Account) {
    return (_.find(account.user.coaches, function(c) { return c._id == coach._id; }) != undefined);
  }

  isAthleteInUser(athlete: User, account: Account) {
    return (_.find(account.user.athletes, function(a) { return a._id == athlete._id; }) != undefined);
  }

  isCoachRequestYetSent(user: User, account: Account) {
    let userId = account.user._id;
    return (
      (_.find(user.notifications, function(n) { return (!n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.from._id == userId); }) != undefined) ||                   // FROM CHECK: check user per user, if in its notification there is one COACH request from the current user 
      (_.find(account.user.notifications, function(n) { return (!n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.from._id == user._id); }) != undefined)     // DESTINATION CHECK: check in the current user if in its notification there is an ATHLETE request from user per user
    );

  }

  isAthleteRequestYetSent(user: User, account: Account) {
    let userId = account.user._id;
    return (
      (_.find(user.notifications, function(n) { return (!n.bConsumed &&  n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.from._id == userId); }) != undefined) ||               // FROM CHECK: check user per user, if in its notification there is one ATHLETE request from the current user 
      (_.find(account.user.notifications, function(n) { return (!n.bConsumed &&  n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.from._id == user._id); }) != undefined)     // DESTINATION CHECK: check in the current user if in its notification there is a COACH request from user per user
      );
  }

  canCoachRequestBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) && 
      (user.userType == 'coach' || user.userType == 'both') && 
      (account.user.userType=='athlete' || account.user.userType == 'both') && 
      !this.isCoachInUser(user, account) && 
      !this.isCoachRequestYetSent(user, account)
    );
  }

  canAthleteRequestBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) && 
      (user.userType == 'athlete' || user.userType == 'both') && 
      (account.user.userType=='coach' || account.user.userType == 'both') && 
      !this.isAthleteInUser(user, account) && 
      !this.isAthleteRequestYetSent(user, account)
    );
  }

  /** 
   * Used to check if a cancel athlete to coach link can be sent (used to broke an existing link between athlete and coach, from athlete to coach). 
   * This kind of request can be sent to an user only if the user checked figures out in the coaches list of the current user  
   */
  canCancelAthleteToCoachLinkBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) &&
      (_.find(account.user.coaches, function(c) { return c._id == user._id; }) != undefined) 
    );
  }

  /** 
   * Used to check if a cancel coach to athlete link can be sent (used to broke an existing link between coach and athlete, from coach to athlete). 
   * This kind of request can be sent to an user only if the user checked figures out in the athlete list of the current user  
   */
  canCancelCoachToAthleteLinkBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) &&
      (_.find(account.user.athletes, function(a) { return a._id == user._id }) != undefined) 
    );
  }

  /** 
   * Used to check if a cancel athlete to coach link request can be sent (used to cancel a request to create a link between athlete and coach, from athlete to coach). 
   * This kind of request can be sent to an user only if the user checked figures out in a notification as destination and that notification is a coach_request  
   */
  canCancelAthleteToCoachLinkRequestBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) &&
      (_.find(user.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.destination._id == user._id }) != undefined) 
    )
  }

  /** 
   * Used to check if a cancel coach to athlete link request can be sent (used to cancel a request to create a link between coach and athlete, from coach to athlete). 
   * This kind of request can be sent to an user only if the user checked figures out in a notification as destination and that notification is an athlete_request  
   */
  canCancelCoachToAthleteLinkRequestBeSent(user: User, account: Account) {
    return (
      (user._id != account.user._id) &&
      (_.find(user.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.destination._id == user._id }) != undefined)  
    )
  }

  

  /* === ACTION FUNCTIONS === */
  async sendNotification(notificationType: NOTIFICATION_TYPE, destinationUser: User, account: Account) {
    let notificationMessage;
    let newNotification;

    switch(notificationType) {
      case NOTIFICATION_TYPE.ATHLETE_REQUEST:
        notificationMessage = "Richiesta Follow da Coach";
        break;
      case NOTIFICATION_TYPE.COACH_REQUEST:
        notificationMessage = "Richiesta Follow da Atleta";
        break;
    }

    newNotification = new Notification("", notificationType, account.user._id, destinationUser._id, notificationMessage, false, new Date()); // Note: id is empty because it is assigned from the back-end
    
    return new Promise((resolve, reject) => {
      this.httpService.sendNotification(destinationUser._id, newNotification)
      .subscribe(
        (data: any) => {
          // Note: this function doesn't need to update any user because update is made using sockets
          console.log("Send Notification destination User", data);
          resolve(data);
        },
        (error: HttpErrorResponse) => {
          console.log("Send Notification Error", error);
          reject(error || MESSAGES.NOTIFICATION_SENT_FAIL);
        });
    });
  }
  

  cancelAthleteCoachLink(notificationType: NOTIFICATION_TYPE, destinationUser: User, account: Account) {
    let notificationMessage;
    let newNotification;

    switch(notificationType) {
      case NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK:
        notificationMessage = "Legame atleta-coach eliminato da parte dell'atleta " + account.user.name + " " + account.user.surname;
        break;
      case NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK:
        notificationMessage = "Legame coach-atleta eliminato da parte del coach " + account.user.name + " " + account.user.surname;
    }

    newNotification = new Notification("", notificationType, account.user._id, destinationUser._id, notificationMessage, false, new Date()); // Note: id is empty because it is assigned from the back-end
    

    return new Promise((resolve, reject) => {
      this.httpService.cancelAthleteCoachLink(destinationUser._id, newNotification)
      .subscribe(
        (data: any) => {
          // Note: this function doesn't need to update any user because update is made using sockets
          console.log("cancelAthleteCoachLink result data", data);
          resolve(data);
        },
        (error: HttpErrorResponse) => {
          console.log("cancelAthleteCoachLink error", error);
          reject(error || MESSAGES.NOTIFICATIONS_CANCEL_LINK_FAIL);
        });
    });
  }


  cancelAthleteCoachLinkRequest(notificationType: NOTIFICATION_TYPE, destinationUser: User) {
    let notification;

    // Find the notification which need to be canceled
    switch(notificationType) {
      case NOTIFICATION_TYPE.CANCEL_ATHLETE_TO_COACH_LINK_REQUEST:
        notification = _.find(destinationUser.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.COACH_REQUEST && n.destination._id == destinationUser._id })
        break;
      case NOTIFICATION_TYPE.CANCEL_COACH_TO_ATHLETE_LINK_REQUEST:
        notification =  _.find(destinationUser.notifications, function(n) { return !n.bConsumed && n.type == NOTIFICATION_TYPE.ATHLETE_REQUEST && n.destination._id == destinationUser._id });
        break
    }

    // Send the dismiss request
    return new Promise((resolve, reject) => {
      this.httpService.dismissNotification(destinationUser._id, notification)
      .subscribe(
        (data: any) => {
          // Note: this function doesn't need to update any user because update is made using sockets
          console.log("dismissNotification result data", data);
          resolve(data);
        },
        (error: HttpErrorResponse) => {
          console.log("dismissNotification error", error);
          reject(error || MESSAGES.NOTIFICATION_DISMISSED_FAIL);
        });
    });
  }


  /* VALIDATION FUNCTIONS */
  arePersonalRecordsValidForSubmission(personalRecordList): boolean {
    for (let i = 0; i < personalRecordList.length; i++) {

      // Exercise must be valid
      if (!personalRecordList[i].exercise.name)
        return false;

      // series, rep, weight and rest must be defined and must be less and more than their limits
      for(let s of personalRecordList[i].series) {
        if( 
            (s.seriesNumber == null || s.seriesNumber < this.TRAINING_VALIDATIONS.MIN_SERIES_NUMBER || s.seriesNumber > this.TRAINING_VALIDATIONS.MAX_SERIES_NUMBER) ||
            (s.repNumber == null || s.repNumber < this.TRAINING_VALIDATIONS.MIN_REP_NUMBER || s.repNumber > this.TRAINING_VALIDATIONS.MAX_REP_NUMBER) ||
            (s.weight == null || s.weight < this.TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || s.weight > this.TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER) ||
            (s.rest == null || s.rest < this.TRAINING_VALIDATIONS.MIN_REST_TIME || s.rest > this.TRAINING_VALIDATIONS.MAX_REST_TIME) ||
            (s.comment.length > this.TRAINING_VALIDATIONS.MAX_SESSION_COMMENT_LENGTH)
        )
          return false;
      }

      //one rep pr must be valid
      if(personalRecordList[i].oneRepPR.weight == null || personalRecordList[i].oneRepPR.weight < this.TRAINING_VALIDATIONS.MIN_WEIGHT_NUMBER || personalRecordList[i].oneRepPR.weight > this.TRAINING_VALIDATIONS.MAX_WEIGHT_NUMBER || !personalRecordList[i].oneRepPR.measure)
        return false;
    }

    return true;
  }

}
