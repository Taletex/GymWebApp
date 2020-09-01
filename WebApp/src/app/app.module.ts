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
import { ChartsModule } from 'ng2-charts';
import { EditorModule } from '@tinymce/tinymce-angular';

/* app components */
import { AppComponent } from './app.component';
import { HomepageComponent } from './_components/homepage/homepage.component';
import { PageNotFoundComponent } from './_components/page-not-found/page-not-found.component';
import { SidebarComponent } from './_components/sidebar/sidebar.component';
import { UserProfileComponent } from './_components/user-profile/user-profile.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ChartsModule,
    CommonModule,
    EditorModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot(), 
  ],
  declarations: [
    AppComponent,
    HomepageComponent,
    PageNotFoundComponent,
    SidebarComponent,
    UserProfileComponent
  ],
  providers: [],
  bootstrap: [AppComponent],
  //entryComponents: [ExerciseModalComponent]
})
export class AppModule { }
