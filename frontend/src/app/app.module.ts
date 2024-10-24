import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BeratungsangeboteComponent } from './beratungsangebote/beratungsangebote.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { ScrollUpButtonComponent } from './scroll-up-button/scroll-up-button.component';
import { AusgabeTabelleComponent } from './ausgabe-tabelle/ausgabe-tabelle.component';
import { SemantischeSucheComponent } from './semantische-suche/semantische-suche.component';
import { ImpressumDatenschutzComponent } from './impressum-datenschutz/impressum-datenschutz.component';
import { HeaderComponent } from './header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    BeratungsangeboteComponent,
    KontaktComponent,
    ScrollUpButtonComponent,
    AusgabeTabelleComponent,
    SemantischeSucheComponent,
    ImpressumDatenschutzComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
