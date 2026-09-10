import { Injectable } from '@angular/core';

const KONAMI: string[] = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

@Injectable({ providedIn: 'root' })
export class EasterEggsService {
  private konamiProgress = 0;
  private logoClickCount = 0;
  private logoClickTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private coreDotClicks = 0;

  init(): void {
    if (typeof window === 'undefined') return;

    this.logBootMessage();
    this.watchKonamiCode();
    this.watchLogoTripleClick();
    this.watchThemePreviewShortcut();
    this.mountCoreDot();
    this.watchIdle();
  }

  private logBootMessage(): void {
    console.log(
      '%c demoXChange %c⚡ built in the dark, powered by electric blue',
      'background:#05060A;color:#5CE1FF;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;',
      'background:#10131C;color:#8B96AC;padding:4px 8px;border-radius:0 4px 4px 0;'
    );
  }

  private watchKonamiCode(): void {
    window.addEventListener('keydown', (event) => {
      const expected = KONAMI[this.konamiProgress];
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === expected) {
        this.konamiProgress++;
        if (this.konamiProgress === KONAMI.length) {
          this.konamiProgress = 0;
          this.triggerGlitchFlash();
        }
      } else {
        this.konamiProgress = key === KONAMI[0] ? 1 : 0;
      }
    });
  }

  private triggerGlitchFlash(): void {
    const overlay = document.createElement('div');
    overlay.className = 'ee-glitch-overlay ee-active';
    document.body.appendChild(overlay);
    console.log('%c🔓 sequence accepted', 'color:#5CE1FF;font-weight:bold;');
    setTimeout(() => overlay.remove(), 1500);
  }

  private watchLogoTripleClick(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const logo = target.closest('.navbar-logo');
      if (!logo) return;

      this.logoClickCount++;
      if (this.logoClickTimer) clearTimeout(this.logoClickTimer);
      this.logoClickTimer = setTimeout(() => (this.logoClickCount = 0), 600);

      if (this.logoClickCount === 3) {
        this.logoClickCount = 0;
        logo.classList.add('ee-logo-spin');
        setTimeout(() => logo.classList.remove('ee-logo-spin'), 900);
      }
    });
  }

  private watchThemePreviewShortcut(): void {
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        const root = document.documentElement;
        root.setAttribute('data-theme', 'light');
        setTimeout(() => root.removeAttribute('data-theme'), 3000);
      }
    });
  }

  private mountCoreDot(): void {
    const dot = document.createElement('div');
    dot.className = 'ee-core-dot';
    dot.setAttribute('aria-hidden', 'true');
    dot.addEventListener('click', () => {
      this.coreDotClicks++;
      if (this.coreDotClicks >= 5) {
        this.coreDotClicks = 0;
        const tooltip = document.createElement('div');
        tooltip.className = 'ee-core-tooltip';
        tooltip.textContent = 'Hai trovato il nucleo.';
        document.body.appendChild(tooltip);
        setTimeout(() => tooltip.remove(), 3000);
      }
    });
    document.body.appendChild(dot);
  }

  private watchIdle(): void {
    const IDLE_MS = 45000;
    const reset = () => {
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        document.body.classList.add('ee-idle-pulse');
        setTimeout(() => document.body.classList.remove('ee-idle-pulse'), 2500);
      }, IDLE_MS);
    };
    ['mousemove', 'keydown', 'click', 'scroll'].forEach((eventName) =>
      window.addEventListener(eventName, reset, { passive: true })
    );
    reset();
  }
}
