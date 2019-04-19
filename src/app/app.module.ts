import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DetailRowComponent } from './detail-row/detail-row.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import 'hammerjs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';

import { AuthService } from './auth.service';
import { GuardService } from './guard.service';


const firebaseConfig = {
  apiKey: 'AIzaSyDyC2jTOFdJuuKMcQ7nAcK-fa8w307eZYw',
  authDomain: 'kendoproba.firebaseapp.com',
  databaseURL: 'https://kendoproba.firebaseio.com',
  projectId: 'kendoproba',
  storageBucket: 'kendoproba.appspot.com',
  messagingSenderId: '158527559458'
};

const appRoutes: Routes = [
  {path: '', component: PocetnaComponent, canActivate: [GuardService]},
  {path: 'kendo-table', component: DetailRowComponent, canActivate: [GuardService]},
  {path: 'signin', component: SignInComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'pagenotfound', component: PageNotFoundComponent},
  {path: '**', redirectTo: '/pagenotfound'}
];

@NgModule({
  declarations: [
    AppComponent,
    DetailRowComponent,
    PocetnaComponent,
    SignInComponent,
    SignUpComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    ButtonsModule,
    BrowserAnimationsModule,
    DateInputsModule,
    DialogsModule,
    GridModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DropDownsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [AuthService, GuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
