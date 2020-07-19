import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

/* npm imports */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

/* app components */
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { AthletesComponent } from './components/athletes/athletes.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { ModalsComponent } from './components/modals/modals.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { StatsComponent } from './components/stats/stats.component';
import { CoachesComponent } from './components/coaches/coaches.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    AthletesComponent,
    PageNotFoundComponent,
    SidebarComponent,
    TrainingComponent,
    TrainingsComponent,
    ModalsComponent,
    ExercisesComponent,
    ExerciseComponent,
    UserProfileComponent,
    StatsComponent,
    CoachesComponent
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
