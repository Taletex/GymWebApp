import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* npm imports */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

/* app components */
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { UsersComponent } from './components/users/users.component';
import { UserComponent } from './components/user/user.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { StatsComponent } from './components/stats/stats.component';
import { ExerciseModalComponent } from './components/modals/exercise-modal/exercise-modal.component';
import { TrainingModalComponent } from './components/modals/training-modal/training-modal.component';
import { UserModalComponent } from './components/modals/user-modal/user-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    UsersComponent,
    PageNotFoundComponent,
    SidebarComponent,
    TrainingComponent,
    TrainingsComponent,
    ExercisesComponent,
    ExerciseComponent,
    UserProfileComponent,
    StatsComponent,
    ExerciseModalComponent,
    TrainingModalComponent,
    UserModalComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),  // ToastrModule added
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ExerciseModalComponent]
})
export class AppModule { }
