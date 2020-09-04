import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Components import */
import { HomepageComponent } from '@app/_components/homepage/homepage.component';
import { UserProfileComponent } from '@app/_components/user-profile/user-profile.component';
import { PageNotFoundComponent } from '@app/_components/page-not-found/page-not-found.component';
import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

/* Module import */
const trainingModule = () => import('./training-module/training.module').then(x => x.TrainingModule);
const exerciseModule = () => import('./exercise-module/exercise.module').then(x => x.ExerciseModule);
const userModule = () => import('./user-module/user.module').then(x => x.UserModule);
const sharedModule = () => import('./shared-module/shared.module').then(x => x.SharedModule);

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);


const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full', canActivate: [AuthGuard]},
  { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard]},
  { path: 'trainings', loadChildren: trainingModule},
  { path: 'exercises', loadChildren: exerciseModule},
  { path: 'users', loadChildren: userModule},
  { path: 'userprofile', component: UserProfileComponent},
  
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
