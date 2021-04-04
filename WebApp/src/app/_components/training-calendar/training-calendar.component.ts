import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { colors } from '@app/_components/training-calendar/colors';
import { Session, Training, Week } from '@app/_models/training-model';
import * as _ from 'lodash';
import { VIEW_TYPES } from '@app/_services/general-service/general-service.service';
import { Account } from '@app/_models';

@Component({
  selector: 'app-training-calendar',
  templateUrl: './training-calendar.component.html',
  styleUrls: ['./training-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingCalendarComponent implements OnInit {
  
  @Input() trainingList: Training[];
  @Input() account: Account;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  standardViewEvents: CalendarEvent[] = [];
  monthViewEvents: CalendarEvent[] = [];
  CalendarView = CalendarView;
  activeDayIsOpen: boolean = true;
  selectedTraining: Training;
  selectedSession: Session;
  selectedWeek: Week;
  selectedWeekIndex: number;
  selectedSessionIndex: number;
  options: any;

  constructor() {
  }

  ngOnInit(): void {
    console.log("Training Calendar - Training List", this.trainingList);
    this.initEventLists();
    this.initEvents();
  }

  /* Angular-Calendar Functions */

  // This function init event list: month view will not display training weeks, while week and day views will display them
  initEventLists() {
    if (this.trainingList) {
      this.standardViewEvents = [];
      this.monthViewEvents = [];

      for (let i = 0; i < this.trainingList.length; i++) {
        for (let j = 0; j < this.trainingList[i].weeks.length; j++) {
          this.standardViewEvents.push({ allDay: true, meta: {trainingId: this.trainingList[i]._id, trainingIndex: i, weekIndex: j, viewType: VIEW_TYPES.WEEK}, title: "Settimana " + (j+1) + ", Allenamento " + this.trainingList[i]._id, color: colors[i % colors.length], start: this.addWeeks(this.trainingList[i].startDate, j), end: this.addWeeks(this.trainingList[i].startDate, j+1) });

          for (let k = 0; k < this.trainingList[i].weeks[j].sessions.length; k++) {
            let e = {meta: {trainingId: this.trainingList[i]._id, trainingIndex: i, weekIndex: j, sessionIndex: k, viewType: VIEW_TYPES.SESSION}, title: "Sessione " + (k+1) + ", Settimana " + (j+1) + ", Allenamento " + this.trainingList[i]._id, color: colors[i % colors.length], start: new Date(this.trainingList[i].weeks[j].sessions[k].startDate), end: new Date(this.trainingList[i].weeks[j].sessions[k].endDate) };
            this.standardViewEvents.push(e);
            this.monthViewEvents.push(e);
          }
        }
      }
    }
  }

  initEvents() {
    this.events = this.view == CalendarView.Month ? _.cloneDeep(this.monthViewEvents) : _.cloneDeep(this.standardViewEvents);
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  setView(view: CalendarView) {
    this.view = view;
    this.initEvents();
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
    this.selectedTraining = _.find(this.trainingList, function (t) { return t._id == event.meta.trainingId; });
    this.selectedWeekIndex = Number(event.meta.weekIndex);
    this.selectedSessionIndex = Number(event.meta.sessionIndex);
    this.selectedWeek = this.selectedTraining.weeks[this.selectedWeekIndex];
    this.selectedSession = this.selectedTraining.weeks[this.selectedWeekIndex].sessions[this.selectedSessionIndex];
    this.options = {currentViewType: event.meta.viewType, format: {weeksForRow: 1, seriesFormat: "seriesxrep", maxSessionContainerHeight: "auto"}, currentUser: this.account.user};

    document.getElementById("openSessionModalBtn").click();
  }

  // Others
  addWeeks(dt: Date, n: number) {
    let date = new Date(dt);
    return new Date(date.setDate(date.getDate() + (n * 7)));
  }

}
