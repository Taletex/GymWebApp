import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { colors } from '@app/_components/training-calendar/colors';
import { Training } from '@app/_models/training-model';
import { GeneralService, PAGEMODE, PAGES } from '@app/_services/general-service/general-service.service';

@Component({
  selector: 'app-training-calendar',
  templateUrl: './training-calendar.component.html',
  styleUrls: ['./training-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingCalendarComponent implements OnInit {

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  @Input() trainingList: Training[];
  PAGEMODE = PAGEMODE;
  PAGES = PAGES;

  constructor(private generalService: GeneralService) {
  }

  ngOnInit(): void {
    console.log("Training Calendar - Training List", this.trainingList);

    if(this.trainingList) {
      for(let i=0; i<this.trainingList.length; i++){
        for(let j=0; j<this.trainingList[i].weeks.length; j++) {
          for(let k=0; k<this.trainingList[i].weeks[j].sessions.length; k++) {
            this.events.push({title: this.trainingList[i]._id, color: colors[i%colors.length], start: new Date(this.trainingList[i].weeks[j].sessions[k].startDate), end: new Date(this.trainingList[i].weeks[j].sessions[k].endDate)});
          }
        }
      }
    }
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
    this.openPageWithMode(PAGEMODE.READONLY, PAGES.TRAININGS, event.title);
  }

   // From services
   openPageWithMode(mode: PAGEMODE, page: PAGES, id?: string) {
    this.generalService.openPageWithMode(mode, page, id);
  } 

}
