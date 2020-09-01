import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { TrainingComponent } from './components/training/training.component';
import { TrainingsComponent } from './components/trainings/trainings.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: TrainingsComponent },
            { path: ':_id', component: TrainingComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TrainingRoutingModule { }