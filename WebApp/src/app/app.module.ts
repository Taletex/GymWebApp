import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* npm imports */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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

import { JwtInterceptor, ErrorInterceptor, appInitializer } from './_helpers';
import { AccountService } from '@app/_services/account-service/account-service.service';

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
    SidebarComponent
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
