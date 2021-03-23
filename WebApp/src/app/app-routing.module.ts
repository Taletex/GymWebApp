import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Components import */
import { HomepageComponent } from '@app/_components/homepage/homepage.component';
import { NotificationsComponent } from '@app/_components/notifications/notifications.component';
import { PageNotFoundComponent } from '@app/_components/page-not-found/page-not-found.component';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

/* Module import */
const trainingModule = () => import('./training-module/training.module').then(x => x.TrainingModule);
const exerciseModule = () => import('./exercise-module/exercise.module').then(x => x.ExerciseModule);
const userModule = () => import('./user-module/user.module').then(x => x.UserModule);
const sharedModule = () => import('./shared-module/shared.module').then(x => x.SharedModule);

const accountModule = () => import('./account-module/account.module').then(x => x.AccountModule);
const profileModule = () => import('./profile-module/profile.module').then(x => x.ProfileModule);
const adminModule = () => import('./admin-module/admin.module').then(x => x.AdminModule);


const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full', canActivate: [AuthGuard]},
  { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard], data: {animation: 'HomePage'}},
  { path: 'trainings', loadChildren: trainingModule, canActivate: [AuthGuard], data: {animation: 'TrainingsPage'}},
  { path: 'exercises', loadChildren: exerciseModule, canActivate: [AuthGuard], data: {animation: 'ExercisesPage'}},
  { path: 'users', loadChildren: userModule, canActivate: [AuthGuard], data: {animation: 'UsersPage'}},
  { path: 'userprofile', loadChildren: profileModule, canActivate: [AuthGuard], data: {animation: 'UserProfilePage'}},
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard], data: {animation: 'NotificationsPage'}},
  
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin], animation: 'AdminPage' },  },
  
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
