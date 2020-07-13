import { Injectable } from '@angular/core';
import * as data from 'src/app/jsons/user.json';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private user;

  constructor() {
    this.user = (data as any).default;
  }

  public getUsername(): string {
    return this.user.username;
  }

  public getCurrentUser(): object {
    return this.user;
  }
}
