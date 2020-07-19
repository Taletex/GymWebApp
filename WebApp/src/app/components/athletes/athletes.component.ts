import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-athletes',
  templateUrl: './athletes.component.html',
  styleUrls: ['./athletes.component.scss']
})
export class AthletesComponent implements OnInit {
  private pokemonData: any;
  public athleteList: Array<Object>;

  constructor() {}

  ngOnInit() {

    this.athleteList = [
      { athlete: {name: 'Alessandro', surname: 'Messina', age: '23', bodyweight: '85'},
        maximum: {squat: 210, deadlift: 280, benchpress: 150, militarypress: 97, frontsquat: 170, cleanandjerk: 130}
      },
      { athlete: {name: 'Alberto', surname: 'Messina', age: '22', bodyweight: '81'},
        maximum: {squat: 180, deadlift: 220, benchpress: 140, militarypress: 90, frontsquat: 130, cleanandjerk: 100}
      }
    ];
  }

}
