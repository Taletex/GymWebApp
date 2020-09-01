import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { ExerciseComponent } from './components/exercise/exercise.component';
import { ExercisesComponent } from './components/exercises/exercises.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: ExercisesComponent },
            { path: ':_id', component: ExerciseComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExerciseRoutingModule { }