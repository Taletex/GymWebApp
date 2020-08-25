import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http-service.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
  }

}
