import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-service.service';

@Component({
  selector: 'app-maximum',
  templateUrl: './maximum.component.html',
  styleUrls: ['./maximum.component.scss']
})
export class MaximumComponent implements OnInit {

  private pokemonData: any;
  public massimaliList: Array<Object>;

  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.httpService.getPokemons().subscribe(data => {
      this.pokemonData = data;
    });

    this.massimaliList = [
      { atleta: {nome: 'Alessandro', cognome: 'Messina', eta: '23', bw: '85'},
        massimali: {squat: 210, stacco: 280, panca: 150, military_press: 97, front_squat: 170, clean_jerk: 130}
      },
      { atleta: {nome: 'Alberto', cognome: 'Messina', eta: '22', bw: '81'},
        massimali: {squat: 180, stacco: 220, panca: 140, military_press: 90, front_squat: 130, clean_jerk: 100}
      }
    ];
  }
}
