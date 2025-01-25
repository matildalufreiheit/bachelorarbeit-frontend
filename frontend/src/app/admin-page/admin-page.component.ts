import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';
import { forkJoin } from 'rxjs';

interface Tag {
  ID: number;
  Tag: string;
  Tag_EN: string; // Englischer Name
  PreferredTag: string; // Bevorzugter Name basierend auf Sprache
}

interface Zielgruppe {
  ID: number;
  Name: string;
  Zielgruppe_EN: string; // Englischer Name
  PreferredTag: string; // Bevorzugter Name basierend auf Sprache
}

interface Angebot {
  ID: number;
  InstitutionID: number;
  Name: string;
  Name_EN: string;
  Beschreibung: string;
  Beschreibung_EN: string;
  URL: string;
  URL_EN: string;
}

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
})


export class AdminPageComponent implements OnInit {
  isLoggedIn = false;
  selectedTags: number[] = [];
  selectedZielgruppen: number[] = [];
  selectedTagId: number | null = null;
  selectedTagName: string = '';
  selectedZielgruppeId: number | null = null;
  selectedZielgruppeName: string = '';
  newTag: { de: string; en: string } = { de: '', en: '' };
  newZielgruppe: { de: string; en: string } = { de: '', en: '' };
  angebotsarten: { ID: number; Art: string }[] = [];
  selectedArt: number[] = []; // Jetzt ein Array von IDs, da mehrere Arten ausgewählt werden können
  institutionNames: string[] = [];
  institutions: any[] = []; // Liste der Institutionen
  selectedInstitutionId: number | null = null; // ID der ausgewählten Institution
  selectedInstitution: Angebot | null = null;
  users: any[] = [];
  selectedUserId: number | null = null;
  institutionName: string = ''; // Name der Institution
  institutionDescription: string = ''; // Beschreibung der Institution
  institutionURL: string = ''; // URL der Institution
  institutionNameEN: string = ''; // Name der Institution
  institutionDescriptionEN: string = ''; // Beschreibung der Institution
  institutionURLEN: string = ''; // URL der Institution
  arten: { ID: number; Art: string }[] = []; // Speichere die Arten
  //tags: { ID: number; Tag: string }[] = [];
  tags: Tag[] = [];
  //zielgruppen: { ID: number; Name: string }[] = [];
  zielgruppen: Zielgruppe[] = [];
  originalInstitution: any | null = null;
  selectedTagNameEN: string = ''; // Englischer Name des ausgewählten Tags
  selectedZielgruppeNameEN: string = ''; // Englischer Name des ausgewählten Tags
  newSuchbegriffe: string = '';
  selectedSuchbegriffe: string = '';

  // Modus für die Aktionen: "neu", "löschen", "ändern"
  mode: 'neu' | 'löschen' | 'ändern' | 'neuerBenutzer' |'' = ''; // Standardmäßig kein Modus ausgewählt


  // Steuerungsvariablen für die Sichtbarkeit der Felder
  showAddTagForm: boolean = false;
  showAddZielgruppeForm: boolean = false;

  constructor(private dataService: DataService, public languageService: LanguageService) {}

  ngOnInit() {
    this.loadTags();
    this.loadZielgruppen();
    //this.loadAngebotsarten();
    this.loadInstitutions();
    this.loadArten();
    this.loadUsers();
    this.getAngebote();

    // Sprache beobachten und bei Änderung Tags und Zielgruppen neu laden
    this.languageService.currentLang$.subscribe(() => {
    this.loadTags();
    this.loadZielgruppen();
    this.loadArten();
    this.getAngebote();
  });
  }



  loadUsers(): void {
    this.dataService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.data;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Benutzer:', err);
      },
    });
  }

  deleteUser(userId: number | null): void {
    if (!userId) {
      console.error('Kein Benutzer ausgewählt.');
      return;
    }

    this.dataService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.ID !== userId);
        this.selectedUserId = null;
        alert('Benutzer erfolgreich gelöscht!');
      },
      error: (err) => {
        console.error('Fehler beim Löschen des Benutzers:', err);
        alert('Fehler beim Löschen des Benutzers.');
      },
    });
  }


  login(username: string, password: string) {
    this.dataService.login(username, password).subscribe({
      next: (response) => {
        if (response.success) {
          this.isLoggedIn = true;
          //this.userRole = response.rolle; // Speichere die Rolle
          alert('Erfolgreich angemeldet!');
        }
      },
      error: (err) => {
        console.error('Fehler beim Anmelden:', err);
        alert(err.error.error || 'Anmeldung fehlgeschlagen.');
      },
    });
  }  

  register(username: string, password: string) {
  this.dataService.register(username, password).subscribe({
    next: (response) => {
      alert('Benutzer erfolgreich registriert!');
    },
    error: (err) => {
      console.error('Fehler bei der Registrierung:', err);
      alert(err.error.error || 'Registrierung fehlgeschlagen.');
    },
  });
  }

  logout() {
    this.isLoggedIn = false;
  }

createAngebot(name: string, description: string, url: string, nameEn: string, descriptionEn: string, urlEn: string, suchbegriffe: string) {
    const angebot = {
        name,
        beschreibung: description,
        name_en: nameEn, // Englischer Name
        beschreibung_en: descriptionEn, // Englische Beschreibung
        url_en: urlEn, // Englische URL
        arten: this.selectedArt, // IDs der ausgewählten Arten
        url,
        tags: this.selectedTags, // IDs der ausgewählten Tags
        zielgruppen: this.selectedZielgruppen, // IDs der ausgewählten Zielgruppen
        suchebegriffe: suchbegriffe.split(',').map((kw) => kw.trim()), // Split & trim für Freitextfeld
      //   institution: {
      //     name, // Deutscher Name der Institution
      //     beschreibung: description, // Deutsche Beschreibung der Institution
      //     url, // Deutsche URL der Institution
      //     name_en: nameEn, // Englischer Name der Institution
      //     beschreibung_en: descriptionEn, // Englische Beschreibung der Institution
      //     url_en: urlEn // Englische URL der Institution
      // }
    };

    console.log('Gesendete Daten:', angebot); // Debugging

    this.dataService.createAngebot(angebot).subscribe({
        next: (response) => {
            console.log('Angebot erfolgreich erstellt:', response);
            alert('Das Angebot wurde erfolgreich erstellt.');
            this.resetForm();
        },
        error: (err) => {
            console.error('Fehler beim Erstellen des Angebots:', err);
            alert('Es gab einen Fehler beim Speichern des Angebots.');
        },
    });
}

  private resetForm() {
    this.selectedTags = [];
    this.selectedZielgruppen = [];
    this.newTag = { de: '', en: '' };
    this.newZielgruppe = { de: '', en: '' };
  }  

  private resetFields(): void {
    this.selectedInstitutionId = null;
    this.selectedInstitution = null;
    this.selectedTags = [];
    this.selectedZielgruppen = [];
    this.selectedArt = [];
    this.originalInstitution = null;
  }
  
  
  onTagsChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTags = Array.from(selectElement.selectedOptions).map(
      (option) => +option.value
    );
  }

  onZielgruppenChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedZielgruppen = Array.from(selectElement.selectedOptions).map(
      (option) => +option.value
    );
  }

  onTagCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = +checkbox.value;

    if (checkbox.checked) {
      this.selectedTags.push(value);
    } else {
      this.selectedTags = this.selectedTags.filter((id) => id !== value);
    }
  }

  onZielgruppeCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = +checkbox.value;

    if (checkbox.checked) {
      this.selectedZielgruppen.push(value);
    } else {
      this.selectedZielgruppen = this.selectedZielgruppen.filter(
        (id) => id !== value
      );
    }
  }

  // Methode zum Hinzufügen eines neuen Tags
  addTag(): void {
    if (!this.newTag.de.trim() || !this.newTag.en.trim()) {
      alert('Bitte geben Sie sowohl den deutschen als auch den englischen Namen für das Tag ein.');
      return;
    }
  
    const tagData = {
      de: this.newTag.de.trim(),
      en: this.newTag.en.trim()
    };
  
    this.dataService.addTag(tagData).subscribe({
      next: (response) => {
        console.log('Tag erfolgreich erstellt:', response);
        alert(`Das Tag "${tagData.de}" wurde erfolgreich hinzugefügt.`);
        this.loadTags(); // Tags-Liste aktualisieren
        this.newTag = { de: '', en: '' }; // Eingabefelder zurücksetzen
      },
      error: (err) => {
        console.error('Fehler beim Hinzufügen des Tags:', err);
        alert('Fehler beim Hinzufügen des Tags. Bitte versuchen Sie es erneut.');
      }
    });
  }  
  
  addZielgruppe(): void {
    if (!this.newZielgruppe.de.trim() || !this.newZielgruppe.en.trim()) {
      alert('Bitte geben Sie sowohl den deutschen als auch den englischen Namen für die Zielgruppe ein.');
      return;
    }
  
    const zielgruppeData = {
      de: this.newZielgruppe.de.trim(),
      en: this.newZielgruppe.en.trim()
    };
  
    this.dataService.addZielgruppe(zielgruppeData).subscribe({
      next: (response) => {
        console.log('Zielgruppe erfolgreich erstellt:', response);
        alert(`Die Zielgruppe "${zielgruppeData.de}" wurde erfolgreich hinzugefügt.`);
        this.loadZielgruppen(); // Zielgruppen-Liste aktualisieren
        this.newZielgruppe = { de: '', en: '' }; // Eingabefelder zurücksetzen
      },
      error: (err) => {
        console.error('Fehler beim Hinzufügen der Zielgruppe:', err);
        alert('Fehler beim Hinzufügen der Zielgruppe. Bitte versuchen Sie es erneut.');
      }
    });
  }  

  // Tag bearbeiten
  editTag(): void {
    if (this.selectedTagId === null || !this.selectedTagName.trim() || !this.selectedTagNameEN.trim()) {
      alert('Bitte geben Sie sowohl den deutschen als auch den englischen Namen ein.');
      return;
    }
  
    const tagData = {
      de: this.selectedTagName,
      en: this.selectedTagNameEN,
    };
  
    this.dataService.updateTag(this.selectedTagId, tagData).subscribe({
      next: () => {
        alert('Tag erfolgreich bearbeitet.');
        this.loadTags(); // Aktualisiert die Liste der Tags
        this.selectedTagId = null;
        this.selectedTagName = '';
        this.selectedTagNameEN = '';
      },
      error: (err) => {
        console.error('Fehler beim Bearbeiten des Tags:', err);
        alert('Fehler beim Bearbeiten des Tags.');
      },
    });
  }
  
  
  

// Zielgruppe bearbeiten
editZielgruppe(): void {
  if (this.selectedZielgruppeId === null || !this.selectedZielgruppeName.trim() || !this.selectedZielgruppeNameEN.trim()) {
    alert('Bitte geben Sie sowohl den deutschen als auch den englischen Namen ein.');
    return;
  }

  const zielgruppeData = {
    de: this.selectedZielgruppeName,
    en: this.selectedZielgruppeNameEN,
  };

  this.dataService.updateZielgruppe(this.selectedZielgruppeId, zielgruppeData).subscribe({
    next: () => {
      alert('Zielgruppe erfolgreich bearbeitet.');
      this.loadZielgruppen(); // Zielgruppen-Liste aktualisieren
      this.selectedZielgruppeId = null;
      this.selectedZielgruppeName = '';
      this.selectedZielgruppeNameEN = '';
    },
    error: (err) => {
      console.error('Fehler beim Bearbeiten der Zielgruppe:', err);
      alert('Fehler beim Bearbeiten der Zielgruppe.');
    },
  });
}


onTagSelectionChange(tagId: number): void {
  const selectedTag = this.tags.find(tag => tag.ID === tagId);
  if (selectedTag) {
    this.selectedTagName = selectedTag.Tag; // Deutscher Name
    this.selectedTagNameEN = selectedTag.Tag_EN; // Englischer Name
    console.log('Ausgewähltes Tag:', selectedTag);
  } else {
    console.error('Tag nicht gefunden:', tagId);
  }
}



onZielgruppeSelectionChange(zielgruppeId: number): void {
  const selectedZielgruppe = this.zielgruppen.find(zielgruppe => zielgruppe.ID === zielgruppeId);
  if (selectedZielgruppe) {
    this.selectedZielgruppeName = selectedZielgruppe.Name; // Deutscher Name
    this.selectedZielgruppeNameEN = selectedZielgruppe.Zielgruppe_EN; // Englischer Name
    console.log('Ausgewählte Zielgruppe:', selectedZielgruppe);
  } else {
    console.error('Zielgruppe nicht gefunden:', zielgruppeId);
  }
}


  
private loadTags(): void {
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  this.dataService.getTags(lang).subscribe({
    next: (response: { data: Tag[] }) => {
      this.tags = response.data;
      console.log('Geladene Tags:', this.tags); // Debugging
    },
    error: (err) => {
      console.error('Fehler beim Laden der Tags:', err);
    },
  });
}

private loadZielgruppen(): void {
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  this.dataService.getZielgruppen(lang).subscribe({
    next: (response: { data: Zielgruppe[] }) => {
      this.zielgruppen = response.data;
      console.log('Geladene Zielgruppen:', this.zielgruppen); // Debugging
    },
    error: (err) => {
      console.error('Fehler beim Laden der Zielgruppen:', err);
    },
  });
}

private loadArten(): void {
  console.log('loadArten() wird aufgerufen...'); // Debugging
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  console.log('Aktuelle Sprache für Arten:', lang); // Debugging

  this.dataService.getArten(lang).subscribe({
    next: (response: any) => {
      this.arten = response.data;
      console.log('Geladene Angebotsarten:', this.angebotsarten); // Debugging
    },
    error: (err) => {
      console.error('Fehler beim Laden der Angebotsarten:', err); // Fehlerprotokoll
    }
  });
  } 

  getAngebote(): void {
    this.dataService.getAngebote().subscribe({
      next: (response: any) => {
        this.institutions = response.data; // Angebote den Institutionen zuordnen
        console.log('Geladene Angebote:', this.institutions); // Debugging
      },
      error: (err) => {
        console.error('Fehler beim Laden der Angebote:', err); // Fehlerprotokoll
      },
    });
  }
   

  // Lädt die Liste aller Institutionen
  loadInstitutions(): void {
    const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
    this.dataService.getInstitutions(lang).subscribe({
      next: (response: any) => {
        this.institutions = response.data;
        console.log('Geladene Institutionen:', this.institutions); // Debugging
      },
      error: (err) => {
        console.error('Fehler beim Laden der Institutionen:', err);
      },
    });
  }  

  onInstitutionSelected(institutionId: number): void {
    console.log('Institution ausgewählt mit ID:', institutionId);
  
    // Schritt 1: Institution aus der Liste suchen und Basisdaten setzen
    const institution = this.institutions.find(inst => inst.ID === institutionId);
    if (institution) {
      this.selectedInstitution = { ...institution }; // Kopiere die Institution
  
      // Schritt 2: Felder mit Basisdaten aus der Institution belegen
      this.institutionName = institution.Name || '';
      this.institutionNameEN = institution.Name_EN || '';
      this.institutionDescription = institution.Beschreibung || '';
      this.institutionDescriptionEN = institution.Beschreibung_EN || '';
      this.institutionURL = institution.URL || '';
      this.institutionURLEN = institution.URL_EN || '';
  
      console.log('Institution geladen:', this.selectedInstitution);
  
      // Schritt 3: Zusätzliche Daten (Tags, Zielgruppen, Arten) laden
      this.dataService.getAngebotTags(institutionId).subscribe({
        next: (response) => {
          this.selectedTags = response.data.map((tag: any) => tag.TagID);
          console.log('Vorhandene Tags:', this.selectedTags);
        },
        error: (err) => console.error('Fehler beim Laden der Tags:', err),
      });
  
      this.dataService.getAngebotZielgruppe(institutionId).subscribe({
        next: (response) => {
          this.selectedZielgruppen = response.data.map((zielgruppe: any) => zielgruppe.ZielgruppeID);
          console.log('Vorhandene Zielgruppen:', this.selectedZielgruppen);
        },
        error: (err) => console.error('Fehler beim Laden der Zielgruppen:', err),
      });
  
      this.dataService.getAngebotArt(institutionId).subscribe({
        next: (response) => {
          this.selectedArt = response.data.map((art: any) => art.ArtID);
          console.log('Vorhandene Arten:', this.selectedArt);
        },
        error: (err) => console.error('Fehler beim Laden der Arten:', err),
      });

      this.dataService.getAngebotById(institutionId).subscribe({
        next: (response) => {
          console.log('response suchbegriffe : ', response)
          this.selectedSuchbegriffe = response.data.Suchbegriffe.toString();
        },
        error: (err) => console.error('Fehler beim Laden der Suchbegriffe:', err),
      })
    } else {
      console.error('Institution nicht gefunden:', institutionId);
      return;
    }
  
    // Schritt 4: Zusätzliche Daten für Deutsch und Englisch laden (falls API verfügbar)
    this.loadInstitutionDetails(institutionId);
  }
   

  // Lädt die Details einer spezifischen Institution
  loadInstitutionDetails(institutionId: number): void {
    console.log('loadInstitutionDetails wird aufgerufen mit ID:', institutionId);

    // Anfragen für Deutsch und Englisch
    const deutsch$ = this.dataService.getAngebotById(institutionId, 'de');
    const englisch$ = this.dataService.getAngebotById(institutionId, 'en');
  
    forkJoin([deutsch$, englisch$]).subscribe(
      ([deutschData, englischData]) => {
        const deutsch = deutschData.data;
        const englisch = englischData.data;
    
        console.log('Deutsche Daten (extrahiert):', deutsch);
        console.log('Englische Daten (extrahiert):', englisch);
    
        this.institutionName = deutsch.Name || '';
        this.institutionDescription = deutsch.Beschreibung || '';
        this.institutionURL = deutsch.url || ''; // Anpassung hier
    
        this.institutionNameEN = englisch.Name || '';
        this.institutionDescriptionEN = englisch.Beschreibung || '';
        this.institutionURLEN = englisch.url || ''; // Anpassung hier
    
        console.log('Zuordnung:');
        console.log('Deutscher Name:', this.institutionName);
        console.log('Englischer Name:', this.institutionNameEN);
        console.log('Deutsche Beschreibung:', this.institutionDescription);
        console.log('Englische Beschreibung:', this.institutionDescriptionEN);
        console.log('Deutsche URL:', this.institutionURL);
        console.log('Englische URL:', this.institutionURLEN);
      },
      (err) => {
        console.error('Fehler beim Laden der Angebotsdaten:', err);
      }
    );
    
    
    console.log('Zuordnung:');
    console.log('Deutscher Name:', this.institutionName);
    console.log('Englischer Name:', this.institutionNameEN);
    console.log('Deutsche Beschreibung:', this.institutionDescription);
    console.log('Englische Beschreibung:', this.institutionDescriptionEN);
    console.log('Deutsche URL:', this.institutionURL);
    console.log('Englische URL:', this.institutionURLEN);
  }
  
  
  //NEU saveChanges:
  saveChanges(): void {
    if (!this.selectedInstitutionId) {
      alert('Keine Institution ausgewählt.');
      return;
    }
  
    const updatedData = {
      Name: this.institutionName,
      Beschreibung: this.institutionDescription,
      URL: this.institutionURL,
      Name_EN: this.institutionNameEN,
      Beschreibung_EN: this.institutionDescriptionEN,
      URL_EN: this.institutionURLEN,
      Tags: this.selectedTags,
      Zielgruppen: this.selectedZielgruppen,
      Arten: this.selectedArt,
      Suchebegriffe: this.selectedSuchbegriffe.split(',').map((kw) => kw.trim()), // NEU
    };

    console.log('Zu aktualisierende Daten:', updatedData);
  
    this.dataService.updateAngebot(this.selectedInstitutionId, updatedData).subscribe({
      next: () => {
        alert('Änderungen erfolgreich gespeichert!');
        this.getAngebote(); // Aktualisiere die Liste
      },
      error: (err) => console.error('Fehler beim Speichern:', err),
    });
  }
    
// Löschen
deleteSelectedInstitution(): void {
  if (this.selectedInstitutionId) {
    this.dataService.deleteInstitution(this.selectedInstitutionId).subscribe({
      next: (response) => {
        console.log('Institution erfolgreich gelöscht:', response);
        this.loadInstitutions(); // Aktualisiere die Liste der Institutionen
        this.resetFields(); // Felder zurücksetzen
        alert('Institution wurde erfolgreich gelöscht.');
      },
      error: (err) => {
        console.error('Fehler beim Löschen der Institution:', err);
        alert('Fehler beim Löschen der Institution.');
      },
    });
  } else {
    console.warn('Keine Institution ausgewählt.');
  }
}

setMode(mode: 'neu' | 'löschen' | 'ändern' | 'neuerBenutzer') {
  this.mode = mode;
}

// Tag löschen
deleteTag(tagId: number | null): void {
  if (tagId === null) {
    alert('Kein gültiger Tag ausgewählt.');
    return;
  }

  this.dataService.deleteTagById(tagId).subscribe({
    next: () => {
      alert('Tag erfolgreich gelöscht.');
      this.loadTags(); // Aktualisiere die Tags-Liste
    },
    error: (err) => {
      console.error('Fehler beim Löschen des Tags:', err);
      alert('Fehler beim Löschen des Tags.');
    },
  });
}

// Zielgruppe löschen:
deleteZielgruppe(zielgruppeId: number | null): void {
  if (zielgruppeId === null) {
    alert('Keine gültige Zielgruppe ausgewählt.');
    return;
  }

  this.dataService.deleteZielgruppeById(zielgruppeId).subscribe({
    next: () => {
      alert('Zielgruppe erfolgreich gelöscht.');
      this.loadZielgruppen(); // Aktualisiere die Zielgruppen-Liste
    },
    error: (err) => {
      console.error('Fehler beim Löschen der Zielgruppe:', err);
      alert('Fehler beim Löschen der Zielgruppe.');
    },
  });
}
  
updateAngebot(id: number, name: string, description: string, url: string) {
  const angebot = {
    art: this.selectedArt,
    beschreibung: description,
    tags: this.selectedTags,
    zielgruppen: this.selectedZielgruppen,
    institution: { name, beschreibung: description, url },
  };

  this.dataService.updateAngebot(id, angebot).subscribe({
    next: () => {
      alert('Angebot erfolgreich aktualisiert.');
    },
    error: (err) => {
      console.error('Fehler beim Aktualisieren des Angebots:', err);
      alert('Es gab einen Fehler beim Aktualisieren des Angebots.');
    },
  });
}
}


