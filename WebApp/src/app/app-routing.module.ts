import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Components import */
import { HomepageComponent } from '@app/_components/homepage/homepage.component';
import { UserProfileComponent } from '@app/_components/user-profile/user-profile.component';
import { PageNotFoundComponent } from '@app/_components/page-not-found/page-not-found.component';

/* Module import */
const trainingModule = () => import('./training-module/training.module').then(x => x.TrainingModule);
const exerciseModule = () => import('./exercise-module/exercise.module').then(x => x.ExerciseModule);
const userModule = () => import('./user-module/user.module').then(x => x.UserModule);
const sharedModule = () => import('./shared-module/shared.module').then(x => x.SharedModule);


const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent},
  { path: 'trainings', loadChildren: trainingModule},
  { path: 'exercises', loadChildren: exerciseModule},
  { path: 'users', loadChildren: userModule},
  { path: 'userprofile', component: UserProfileComponent},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
