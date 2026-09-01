# demoXChange — Design System (Master)

Fonte di verità per stile, colori e tipografia dell'intera app. Le pagine specifiche possono avere override in `design-system/pages/<nome>.md` — in assenza di override, questo file vale sempre.

## Pattern di prodotto
Marketplace / Directory C2C (scambio oggetti, non vendita). Sezioni tipiche di una pagina di ricerca/listing:
1. Hero con ricerca in evidenza
2. Categorie
3. Annunci in evidenza / risultati
4. Segnali di fiducia (recensioni, stato utente)
5. CTA secondaria ("Pubblica un annuncio")

## Stile: Flat Design
- 2D, linee pulite, forme semplici, palette limitata, **nessuna ombra/gradiente pesante**
- Adatto a web app con dashboard multiple (i miei oggetti, i miei annunci, offerte, scambi, messaggi) — non è un sito marketing, è uno strumento
- Bordi: `--radius-sm` (2px) o `--radius-md` (4px), niente angoli molto arrotondati
- Hover: transizione colore/opacità (150–200ms), mai transform che sposta il layout

## Colori (Marketplace P2P — trust purple + transazione green)
| Ruolo | Var CSS | Hex |
|---|---|---|
| Primary | `--color-primary` | `#7C3AED` |
| Primary dark (hover) | `--color-primary-dark` | `#6D28D9` |
| Secondary | `--color-secondary` | `#A78BFA` |
| CTA / successo | `--color-cta` / `--color-success` | `#22C55E` |
| Background | `--color-bg` | `#FAF5FF` |
| Testo | `--color-text` | `#4C1D95` |
| Danger (errori, report) | `--color-danger` | `#DC2626` |
| Warning (stati in sospeso) | `--color-warning` | `#D97706` |
| Neutrali (bordi, testo secondario, superfici bianche) | `--color-neutral-{0,50,100,200,400,600,900}` | scala grigio/slate |

Uso suggerito: primary per azioni principali e brand (navbar, link attivi); CTA verde riservato ad azioni che completano/confermano uno scambio (conferma exchange, offerta accettata); danger per errori e report; neutrali per superfici carta/bordi sopra il background lavanda.

## Tipografia: Modern Professional
- **Heading:** Poppins (500/600/700)
- **Body:** Open Sans (400/500/600)
- Font size scale: 12 / 14 / 16 (base) / 18 / 24 / 32 px
- Line-height corpo testo: 1.6

Import già presente in `src/styles.css`.

## Token condivisi
Tutti i valori sopra sono definiti come CSS custom properties in [`src/styles.css`](../src/styles.css) (`:root`), incluse scale di spaziatura (base 8px: 4/8/16/24/32/48), z-index (`--z-dropdown: 10`, `--z-sticky: 20`, `--z-overlay: 30`, `--z-modal: 50`) e durate di transizione (`--transition-fast: 150ms`, `--transition-base: 200ms`). Nessun framework CSS: il progetto usa CSS puro con custom properties, niente Tailwind/Bootstrap.

## Regole trasversali (da rispettare in ogni pagina/componente)
- Nessuna emoji come icona — usare SVG (es. Heroicons/Lucide)
- Target touch minimo 44×44px
- `cursor-pointer` su ogni elemento cliccabile, incluse le card annuncio
- Contrasto testo minimo 4.5:1 (verificato per `--color-text` su `--color-bg` e su bianco)
- Stato di focus visibile da tastiera (già gestito globalmente via `:focus-visible`)
- `prefers-reduced-motion` rispettato (già gestito globalmente)
- Responsive verificato a 375 / 768 / 1024 / 1440px
- Niente contenuto nascosto dietro navbar fissa; navbar "floating" con margine dai bordi, non incollata a 0/0

## Anti-pattern da evitare
- Bassi segnali di fiducia (rating/numero recensioni sempre visibili sulle card utente/annuncio)
- Layout confuso nelle pagine di ricerca/filtro
