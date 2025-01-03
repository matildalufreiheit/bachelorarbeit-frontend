import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { LanguageService } from '../services/language.service';


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
  selectedInstitution: any = null; // Details der ausgewählten Institution
  users: any[] = [];
  selectedUserId: number | null = null;
  institutionName: string = ''; // Name der Institution
  institutionDescription: string = ''; // Beschreibung der Institution
  institutionURL: string = ''; // URL der Institution
  arten: { ID: number; Art: string }[] = []; // Speichere die Arten
  tags: { ID: number; Tag: string }[] = [];
  zielgruppen: { ID: number; Name: string }[] = [];
  originalInstitution: any | null = null;



  // Modus für die Aktionen: "neu", "löschen", "ändern"
  mode: 'neu' | 'löschen' | 'ändern' | 'neuerBenutzer' |'' = ''; // Standardmäßig kein Modus ausgewählt


  // Steuerungsvariablen für die Sichtbarkeit der Felder
  showAddTagForm: boolean = false;
  showAddZielgruppeForm: boolean = false;

  constructor(private dataService: DataService, private languageService: LanguageService) {}

  ngOnInit() {
    this.loadTags();
    this.loadZielgruppen();
    //this.loadAngebotsarten();
    this.loadInstitutions();
    this.loadArten();
    this.loadUsers();

    // Sprache beobachten und bei Änderung Tags und Zielgruppen neu laden
    this.languageService.currentLang$.subscribe(() => {
    this.loadTags();
    this.loadZielgruppen();
    this.loadArten();
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

createAngebot(name: string, description: string, url: string, nameEn: string, descriptionEn: string, urlEn: string) {
    const angebot = {
        name,
        beschreibung: description,
        name_en: nameEn, // Englischer Name
        beschreibung_en: descriptionEn, // Englische Beschreibung
        url_en: urlEn, // Englische URL
        artIDs: this.selectedArt, // IDs der ausgewählten Arten
        url,
        tags: this.selectedTags, // IDs der ausgewählten Tags
        zielgruppen: this.selectedZielgruppen, // IDs der ausgewählten Zielgruppen
        institution: {
          name, // Deutscher Name der Institution
          beschreibung: description, // Deutsche Beschreibung der Institution
          url, // Deutsche URL der Institution
          name_en: nameEn, // Englischer Name der Institution
          beschreibung_en: descriptionEn, // Englische Beschreibung der Institution
          url_en: urlEn // Englische URL der Institution
      }
    };

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
  if (this.selectedTagId === null || !this.selectedTagName.trim()) {
    alert('Bitte wählen Sie ein Tag aus und geben Sie einen gültigen Namen ein.');
    return;
  }

  this.dataService.updateTag(this.selectedTagId, this.selectedTagName).subscribe({
    next: () => {
      alert('Tag erfolgreich bearbeitet.');
      this.loadTags(); // Tags-Liste aktualisieren
      this.selectedTagId = null;
      this.selectedTagName = '';
    },
    error: (err) => {
      console.error('Fehler beim Bearbeiten des Tags:', err);
      alert('Fehler beim Bearbeiten des Tags.');
    },
  });
}

// Zielgruppe bearbeiten
editZielgruppe(): void {
  if (this.selectedZielgruppeId === null || !this.selectedZielgruppeName.trim()) {
    alert('Bitte wählen Sie eine Zielgruppe aus und geben Sie einen gültigen Namen ein.');
    return;
  }

  this.dataService.updateZielgruppe(this.selectedZielgruppeId, this.selectedZielgruppeName).subscribe({
    next: () => {
      alert('Zielgruppe erfolgreich bearbeitet.');
      this.loadZielgruppen(); // Zielgruppen-Liste aktualisieren
      this.selectedZielgruppeId = null;
      this.selectedZielgruppeName = '';
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
    this.selectedTagName = selectedTag.Tag; // Setze den Tag-Namen
  } else {
    this.selectedTagName = ''; // Zurücksetzen, falls keine Auswahl
  }
}

onZielgruppeSelectionChange(zielgruppeId: number): void {
  const selectedZielgruppe = this.zielgruppen.find(zielgruppe => zielgruppe.ID === zielgruppeId);
  if (selectedZielgruppe) {
    this.selectedZielgruppeName = selectedZielgruppe.Name; // Setze den Zielgruppen-Namen
  } else {
    this.selectedZielgruppeName = ''; // Zurücksetzen, falls keine Auswahl
  }
}

  
private loadTags(): void {
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  this.dataService.getTags(lang).subscribe((response: any) => {
    this.tags = response.data;
  });
}

private loadZielgruppen(): void {
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  this.dataService.getZielgruppen(lang).subscribe((response: any) => {
    this.zielgruppen = response.data;
  });
}


private loadArten(): void {
  console.log('loadArten() wird aufgerufen...'); // Debugging
  const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
  console.log('Aktuelle Sprache für Arten:', lang); // Debugging

  this.dataService.getArten(lang).subscribe({
    next: (response: any) => {
      this.angebotsarten = response.data;
      console.log('Geladene Angebotsarten:', this.angebotsarten); // Debugging
    },
    error: (err) => {
      console.error('Fehler beim Laden der Angebotsarten:', err); // Fehlerprotokoll
    }
  });
}




  // Lädt die Liste aller Institutionen
  loadInstitutions(): void {
    const lang = this.languageService.getCurrentLanguage(); // Aktuelle Sprache abrufen
    this.dataService.getInstitutions(lang).subscribe(response => {
      this.institutions = response.data; // Prüfe, ob response.data korrekt ist
      console.log('Geladene Institutionen:', this.institutions);
    });
  }


  // Wird aufgerufen, wenn eine Institution im Dropdown ausgewählt wird
  onInstitutionSelected(institutionId: number): void {
    console.log('Ausgewählte Institution ID:', institutionId);
    const institution = this.institutions.find(inst => inst.ID === institutionId);
    if (institution) {
      this.selectedInstitution = { ...institution }; // Setze die ausgewählte Institution
      this.institutionName = institution.Name; // Setze den Namen der Institution
      this.institutionDescription = institution.Beschreibung; // Setze die Beschreibung der Institution
      this.institutionURL = institution.URL; // Setze die URL der Institution
  
      this.originalInstitution = { ...institution }; // Speichere den Originalzustand
      console.log('Ausgewählte Institution:', this.selectedInstitution);
    } else {
      console.error('Institution nicht gefunden:', institutionId);
    }
  }
  
  

  // Lädt die Details einer spezifischen Institution
  loadInstitutionDetails(institutionId: number): void {
    const institution = this.institutions.find(inst => inst.ID === institutionId);
    if (institution) {
      this.selectedInstitution = { ...institution }; // Kopie der Institution erstellen
      console.log('Ausgewählte Institution:', this.selectedInstitution);
    } else {
      console.error('Institution konnte nicht gefunden werden:', institutionId);
    }
  }

  // Ändern (Speichern)
  saveChanges(): void {
    if (this.selectedInstitution && this.selectedInstitutionId) {
      const updatedInstitution: any = {};
  
      if (this.selectedInstitution.Name !== this.originalInstitution.Name) {
        updatedInstitution.name = this.selectedInstitution.Name;
      }
      if (this.selectedInstitution.Beschreibung !== this.originalInstitution.Beschreibung) {
        updatedInstitution.beschreibung = this.selectedInstitution.Beschreibung;
      }
      if (this.selectedInstitution.URL !== this.originalInstitution.URL) {
        updatedInstitution.url = this.selectedInstitution.URL;
      }
  
      if (Object.keys(updatedInstitution).length === 0) {
        alert('Keine Änderungen vorgenommen.');
        return;
      }
  
      this.dataService.updateInstitution(this.selectedInstitutionId, updatedInstitution).subscribe({
        next: () => {
          alert('Institution erfolgreich aktualisiert!');
          this.loadInstitutions(); // Aktualisiere die Liste
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren der Institution:', err);
          alert('Fehler beim Aktualisieren der Institution.');
        },
      });
    }
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


