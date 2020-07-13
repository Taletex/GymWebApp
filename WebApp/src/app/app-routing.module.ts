import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaximumComponent } from 'src/app/components/maximum/maximum.component';
import { TrainingsComponent } from 'src/app/components/trainings/trainings.component';
import { TrainingComponent } from './components/training/training.component';
import { HomepageComponent } from 'src/app/components/homepage/homepage.component';
import { PageNotFoundComponent } from 'src/app/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent},
  { path: 'massimali', component: MaximumComponent},
  { path: 'allenamenti', component: TrainingsComponent},
  { path: 'allenamento/:id', component: TrainingComponent},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
