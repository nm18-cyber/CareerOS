# CareerOS design system — "Modern Intelligence"

Live reference: **`/design-system`** (every component on that page is the real one).
Source: `app/styles/` (tokens → components → shell → screens). `app/globals.css` holds legacy
screen styles that were migrated onto the tokens and will shrink as screens are redesigned.

## 1. Strategy

**Who it's for.** People in the middle of a job search — often mid-career, often doing it alongside a
current job — who need to turn real experience into a resume that survives screening and reads well to
a hiring manager, then keep many applications moving.

**The core problem.** Experience is usually written as duties, not evidence; it isn't matched to the
role; and the search lives in scattered tabs. CareerOS answers with three verbs used everywhere:
**Write → Tailor → Track.**

**Personality.** A calm, precise editor. Confident but never loud; specific rather than salesy;
honest about what the tools do (no invented user counts, no fake reviews).

**Visual principles.**
1. *Evidence over decoration* — visuals show the product's actual reasoning (annotated resume, keyword
   coverage, pipeline status), not abstract art.
2. *One accent, used for meaning* — blue only for actions, selection, focus and highlights.
3. *Borders, not shadows* — structure comes from thin rules and whitespace; shadows only for things
   that float (menus, dialogs, toasts).
4. *Navy for weight* — headlines and data carry contrast; the closing call to action band is navy.
5. *Warm ivory for editorial rhythm* — alternating white / ivory bands on public pages; ivory side
   panel on sign-in.

**How it differs from the reference (Teal HQ).** No teal/green palette, no pill-heavy UI, no
illustration-led hero. Instead: an *annotated resume* hero with numbered margin notes, a numbered
*workflow rail* (01-02-03 joined by a hairline), row-based module lists instead of card grids, an
editorial serif used once per page, a navy closing band, and a trajectory brand mark. Copy is
original; sample data uses fictional companies (Northwind, Contoso, Fabrikam).

## 2. Tokens (`app/styles/tokens.css`)

### Colour
| Token | Value | Use | Contrast on white |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | working canvas | — |
| `--color-bg-warm` | `#F7F5EF` | editorial bands, secondary panels | — |
| `--color-bg-muted` | `#F8F9FB` | app background behind cards | — |
| `--color-text` | `#17233B` | headings, labels, data | 15.7 : 1 |
| `--color-text-muted` | `#667085` | supporting copy | 4.97 : 1 (4.56 on warm) |
| `--color-accent` | `#4169E1` | primary actions, links, focus | 4.85 : 1 |
| `--color-accent-hover` | `#3457C7` | hover | 6.3 : 1 |
| `--color-accent-strong` | `#2F4DB0` | pressed; **text on pale blue** | 5.96 : 1 on soft |
| `--color-accent-soft` | `#DCE6FA` | selected surfaces | — |
| `--color-accent-faint` | `#EEF3FD` | hover wash | — |
| `--color-border` | `#D9DEE7` | decorative separators | 1.35 : 1 (decorative only) |
| `--color-border-strong` | `#8A94A6` | **form-field boundaries** | 3.06 : 1 (WCAG 1.4.11) |
| `--color-success` / `-soft` / `-strong` | `#237A57` / `#E7F3EC` / `#1D6648` | success | 5.26 : 1 |
| `--color-warning` / `-soft` / `-strong` | `#A86416` / `#FBF1E3` / `#8A5212` | warning | 4.67 : 1 |
| `--color-error` / `-soft` / `-strong` | `#B42318` / `#FCEBE9` / `#9A1E14` | error | 6.57 : 1 |

Rules: blue text never sits on pale blue (3.86 : 1 fails) — use `--color-accent-strong`.
Status colour is always paired with a text label (`.status`, `.badge`).

### Typography
Manrope (headings, 600–800) · Inter (UI and body, 400–700) · DM Serif Display (one editorial accent
per page). Loaded from Google Fonts in `app/layout.tsx`.

| Token | Size |
|---|---|
| `--text-hero` | 40 → 56 px (fluid) |
| `--text-page` | 30 → 40 px |
| `--text-section` | 22 → 28 px |
| `--text-card` / `--text-lead` | 18 px |
| `--text-body` | 16 px |
| `--text-ui` | 15 px (buttons, nav, inputs) |
| `--text-label` | 14 px |
| `--text-caption` | 13 px |
| `--text-micro` | 12 px — **the floor for any UI text** |

Use `.tabular` (or tables) for figures. Section labels are sentence case (`.label`); avoid all caps.

### Spacing, layout, shape
- Spacing: 4 px base — `--space-1` (4) · 2 (8) · 3 (12) · 4 (16) · 5 (20) · 6 (24) · 8 (32) · 10 (40) · 12 (48) · 16 (64) · 20 (80) · 24 (96).
- Layout: `--container` 1200 px, `--container-narrow` 760 px, `--gutter` 16–40 px, `--sidebar-w` 256 px, `--topbar-h` 64 px.
- Breakpoints: 640 (sm) · 768 (md) · 960 (app sidebar ↔ top bar) · 1024 (lg) · 1280 (xl).
- Radii: 6 (badges) · 10 (buttons, inputs) · 14 (cards) · 20 (hero visuals, dialogs).
- Shadows: `--shadow-sm` (hovered cards) · `--shadow-md` (menus) · `--shadow-lg` (dialogs, toasts).
- Icons: lucide-react at 16 / 20 / 24 px; decorative icons get `aria-hidden`.

### Interaction
- Controls are at least 44 px tall (`--control-h`; 36 px small variant).
- Focus: 2 px blue ring with a 2 px white gap (`--focus-ring`) on every interactive element.
- Motion: 160 ms, `--ease`; all motion is removed under `prefers-reduced-motion`.

## 3. Components (`app/styles/components.css`)

| Component | Classes | Variants & states |
|---|---|---|
| Button | `.button` | primary (default), `.button-secondary`, `.button-tertiary`, `.button-danger`, `.button-dark`, `.button-small`, `.button-block`; hover, active, `:focus-visible`, `:disabled`, loading via `aria-busy="true"`. Legacy aliases: `.button-yellow` = primary, `.outline-button` = secondary, `.text-button` = tertiary. |
| Icon button | `.icon-button` | always needs `aria-label`; optional `data-tooltip`. |
| Field | `.field` > `.field-label` + `.input`/`.select`/`.textarea` + `.field-hint`/`.field-error` | `aria-invalid="true"` styles errors; `.required` marker; `.checkbox`. |
| Card | `.card` | `.card-interactive`, `.card-selected`; `.card-header`, `.card-title`, `.card-meta`, `.card-footer`. |
| Tabs | `.tabs[role=tablist]` > `.tab[role=tab]` | `aria-selected`; arrow / Home / End keys (see showcase). |
| Badge | `.badge` | `-accent`, `-success`, `-warning`, `-error`. |
| Status | `.status` | `-success`, `-warning`, `-error`, `-accent`; dot + text label. |
| Alert | `.alert` | info (default), `-success`, `-warning`, `-error`; use `role="alert"` for errors, `role="status"` for confirmations. |
| Toast | `.toast` | `role="status"`, auto-dismiss after ~3 s, dismiss button. |
| Dialog | `.modal-scrim` > `.modal[role=dialog][aria-modal]` | `.modal-head`, `.modal-actions`; closes on Escape / scrim; focus moves in and returns to the trigger. |
| Dropdown | `.menu-wrap` > `.menu[role=menu]` > `.menu-item` | `.menu-item-danger`, `.menu-separator`; arrow keys; Escape closes. |
| Tooltip | `[data-tooltip]` | supplementary hints only — never the only label. |
| Table | `.table-wrap` > `.table` | `.num` right-aligned tabular cells; sortable headers are buttons with `aria-sort`. |
| Progress | `.progress > span`, `.steps > li[data-state]` | `role="progressbar"` with values; steps `done` / `current`. |
| Empty state | `.empty-state` + `.empty-state-icon` | explain the value, then one action. |
| Loading | `.skeleton`, `.spinner` | wrap the region in `aria-busy="true"`. |
| Brand | `components/brand.tsx` | `<Brand />`, `<BrandMark />`. |

Shell (`app/styles/shell.css`, `components/workspace-sidebar.tsx`): grouped navigation (Create · Job
search · Library), `aria-current="page"` for the active item, user + sign-out at the foot. At or above
960 px it's a fixed sidebar; below that, a top bar with a menu button (`aria-expanded`) that opens a
full-height sheet and closes on Escape.

## 4. Interaction rules

- **Navigation.** Internal links are plain `<a>` tags (vinext 1.0.0-beta.5's `<Link>` throws on
  click). Menus open on click, close on Escape or an outside click.
- **One dominant action** per view, always the primary button; everything else secondary/tertiary.
- **Forms.** Validate on submit, then live as the user fixes a field. Messages say how to fix the
  problem ("Enter a target date."). Disable the submit button and show "Saving…" while busy; keep
  the user's input on failure and show an error alert with a retry path.
- **Feedback.** Every save produces a toast or inline confirmation; optimistic updates roll back with
  an explanation if the request fails.
- **Lists.** Each has loading (skeleton), empty (explain + action) and error (explain + retry) states.
- **Keyboard.** Everything reachable by Tab, skip link on each page, visible focus everywhere, no
  keyboard traps outside dialogs.

## 5. Status and next steps

Redesigned on the system: landing page, sign-in / sign-up / password pages, career library and
article pages, app shell (every signed-in screen), dashboard, `/design-system`.

Migrated (tokens, fonts, readable sizes, new buttons and shell) but not yet re-composed: resume
studio and editor, job tracker and job workspace, discover jobs, career assistant, tools, documents,
companies and contacts, settings, admin, billing. Resume documents, previews and print output keep
their own typography on purpose.
