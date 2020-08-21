import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /**
   * Returns the min difference in term of year, month, day, hour, min or second of a date respect now
   * @param date the date which need to be checked respect now
   * @returns number
   */
  public getTimeDifferenceFromNow(dateToCompare: string): string {
    let date = new Date(dateToCompare);
    let now = new Date();
    let yearDiff = now.getFullYear() - date.getFullYear();
    let monthDiff = now.getMonth() - date.getMonth();
    let dayDiff = now.getDate() - date.getDate();
    let hourDiff = now.getHours() - date.getHours();
    let minDiff = now.getMinutes() - date.getMinutes();

    if(!yearDiff) {
      if(!monthDiff) {
        if(!dayDiff) {
          if(!hourDiff) {
            if(!minDiff) {
              return ((now.getSeconds() - date.getSeconds()).toString() + " seconds");
            } else return (minDiff.toString() + " minutes");
          } else return (hourDiff.toString() + " hours");
        } else return (dayDiff.toString() + " days");
      } else return (monthDiff.toString() + " months");
    } else return (yearDiff.toString() + " years")
  }

  public compareObjects(a: any, b: any): boolean {
    return (a && b && a._id === b._id);
  }
}
