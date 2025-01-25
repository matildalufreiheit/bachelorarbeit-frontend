import { Component } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  fontSizeMenuVisible = false;

  // Schriftgrößen-Dropdown anzeigen/verstecken
  toggleFontSizeMenu(): void {
    this.fontSizeMenuVisible = !this.fontSizeMenuVisible;
  }

  // Schriftgröße ändern
  changeFontSize(size: string): void {
    if (size === 'small') {
      document.body.style.fontSize = '14px';
    } else if (size === 'large') {
      document.body.style.fontSize = '18px';
    }
  }

  constructor(public languageService: LanguageService) {}

  // Sprache wechseln
  switchLanguage() {
    this.languageService.switchLanguage();
  }

  // Aktuelle Sprache abrufen (optional für Anzeige im Template)
  get currentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
}
