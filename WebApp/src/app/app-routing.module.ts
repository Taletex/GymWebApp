import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from 'src/app/components/homepage/homepage.component';
import { TrainingsComponent } from 'src/app/components/trainings/trainings.component';
import { TrainingComponent } from './components/training/training.component';
import { ExercisesComponent } from 'src/app/components/exercises/exercises.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { AthletesComponent } from 'src/app/components/athletes/athletes.component';
import { CoachesComponent } from 'src/app/components/coaches/coaches.component';
import { UserProfileComponent } from 'src/app/components/user-profile/user-profile.component';
import { PageNotFoundComponent } from 'src/app/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent},
  { path: 'trainings', component: TrainingsComponent},
  { path: 'trainings/:_id', component: TrainingComponent},
  { path: 'exercises', component: ExercisesComponent},
  { path: 'exercises/:_id', component: ExerciseComponent},
  { path: 'athletes', component: AthletesComponent},
  { path: 'coaches', component: CoachesComponent},
  { path: 'userprofile', component: UserProfileComponent},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
