import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EasterEggsService } from './core/easter-eggs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class App {
  constructor() {
    inject(EasterEggsService).init();
  }
}
