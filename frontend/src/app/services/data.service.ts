import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://vm021.qu.tu-berlin.de:3000'; 
  //private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient,
    private languageService: LanguageService

  ) { }

  // ----------------------------------------------------------  Angebote
  getAngebote(): Observable<any> {
    const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
    console.log('API wird mit Sprache aufgerufen:', lang);
    return this.http.get(`${this.apiUrl}/angebote?lang=${lang}`);
  }
  

  createAngebot(angebot: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/angebote`, angebot);
  }

  updateAngebot(id: number, angebot: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/angebote/${id}`, angebot);
  }

  getAngebotsnamen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/angebote/namen`);
  }

  // getAngebotById(id: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/angebote/${id}`);
  // }

  getAngebotById(id: number, lang: string = 'de'): Observable<any> {
    return this.http.get(`${this.apiUrl}/angebote/${id}?lang=${lang}`);
  }



  // -------------------------------------------------------------  Tags
  getTags(lang: string = 'de'): Observable<any> {
    return this.http.get(`${this.apiUrl}/tags?lang=${lang}`); // Sprache an API übergeben
  }

  updateTag(tagId: number, tagData: { de: string; en: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/tags/${tagId}`, tagData);
  }
  

  deleteTagById(tagId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tags/${tagId}`);
  }

  addTag(tag: { de: string; en: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tags`, tag );
  }

  getAngebotTagsById(angebotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nm/angebot_tags/${angebotId}`);
  }
  


  // ----------------------------------------------------------- Institutionen
  getInstitutions(lang: string = 'de'): Observable<any> {
    return this.http.get(`${this.apiUrl}/institutionen?lang=${lang}`).pipe(
      tap(response => console.log('API Antwort:', response))
    );
  }

  getInstitutionById(id: number){
    return this.http.get(`${this.apiUrl}/institutionen/${id}`);
  }

  deleteInstitutionByName(name: string): Observable<any> {
    const encodedName = encodeURIComponent(name); // Name für URL kodieren
    return this.http.delete(`${this.apiUrl}/institutionen/name/${encodedName}`);
  }

  updateInstitution(id: number, updatedInstitution: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/institutionen/${id}`, updatedInstitution);
  }

  deleteInstitution(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/institutionen/${id}`);
  }


  // -------------------------------------------------------------  Zielgruppen
  getZielgruppen(lang: string = 'de'): Observable<any> {
    return this.http.get(`${this.apiUrl}/zielgruppen?lang=${lang}`);
  }

  addZielgruppe(zielgruppe: { de: string; en: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/zielgruppen`, zielgruppe );
  }

  updateZielgruppe(zielgruppeId: number, zielgruppeData: { de: string; en: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/zielgruppen/${zielgruppeId}`, zielgruppeData);
  }
  

  deleteZielgruppeById(zielgruppeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/zielgruppen/${zielgruppeId}`);
  }

  getAngebotZielgruppenById(angebotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nm/angebot_zielgruppe/${angebotId}`);
  }
  

  // -------------------------------------------------------------  Benutzer
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/benutzer/login`, { benutzername: username, passwort: password });
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/benutzer/register`, { benutzername: username, passwort: password });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/benutzer`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/benutzer/${userId}`);
  }


  // -------------------------------------------------------------  Arten  ----> 2x???

  getArten(lang: string = 'de'): Observable<any> {
    console.log(`API-Aufruf für Arten: ${this.apiUrl}/angebotsarten?lang=${lang}`); // Debugging
    return this.http.get(`${this.apiUrl}/arten?lang=${lang}`);
  }

  getAngebotArt(angebotId?: number): Observable<any> {
    const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
    const url = angebotId
      ? `${this.apiUrl}/nm/angebot_art/${angebotId}?lang=${lang}`
      : `${this.apiUrl}/nm/angebot_art?lang=${lang}`;
    return this.http.get(url);
  }
  
  


  // -------------------------------------------------------------  n:m
  getAngebotTags(angebotId?: number): Observable<any> {
    const url = angebotId
      ? `${this.apiUrl}/nm/angebot_tags/${angebotId}`
      : `${this.apiUrl}/nm/angebot_tags`;
    console.log('AngebotTags API-Aufruf gestartet:', url);
    return this.http.get(url).pipe(
      tap({
        next: (response) => console.log('Antwort von AngebotTags:', response),
        error: (error) => console.error('Fehler bei AngebotTags:', error),
      })
    );
  }
  
  getAngebotZielgruppe(angebotId?: number): Observable<any> {
    const url = angebotId
      ? `${this.apiUrl}/nm/angebot_zielgruppe/${angebotId}`
      : `${this.apiUrl}/nm/angebot_zielgruppe`;
    console.log('AngeboteZielgruppen API-Aufruf gestartet:', url);
    return this.http.get(url).pipe(
      tap({
        next: (response) => console.log('Antwort von AngebotZielgruppen:', response),
        error: (error) => console.error('Fehler bei AngebotZielgruppen:', error),
      })
    );
  }

}

