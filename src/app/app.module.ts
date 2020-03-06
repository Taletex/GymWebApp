import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

/* npm import */
import { HttpClientModule } from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

/* app components */
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { ConfigComponent } from './components/config/config.component';
import { MaximumComponent } from './components/maximum/maximum.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TrainingModalComponent } from './components/modals/training-modal/training-modal.component';
import { TrainingComponent } from './components/training/training.component';



@NgModule({
  declarations: [
    AppComponent,
    MaximumComponent,
    SidebarComponent,
    TrainingsComponent,
    ConfigComponent,
    MaximumComponent,
    HomepageComponent,
    PageNotFoundComponent,
    TrainingModalComponent,
    TrainingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
