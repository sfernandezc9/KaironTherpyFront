---
name: KaironTherapy
description: Clinical management platform for therapy clinics — grounded, precise, human.
colors:
  deep-forest-teal: "#0f5c5c"
  teal-700: "#126f6f"
  teal-500: "#1a9e9e"
  teal-300: "#3ecece"
  teal-100: "#b8f0f0"
  teal-50: "#e6fafa"
  surface-white: "#ffffff"
  surface-sidebar: "#f1f5f9"
  surface-table-head: "#f8fafc"
  surface-dark: "#0f172a"
  surface-dark-card: "#1e293b"
  ink-primary: "#1e293b"
  ink-secondary: "#475569"
  ink-muted: "#94a3b8"
  border-default: "#e2e8f0"
  border-strong: "#cbd5e1"
  semantic-success-bg: "#dcfce7"
  semantic-success-text: "#166534"
  semantic-warning-bg: "#fef9c3"
  semantic-warning-text: "#854d0e"
  semantic-error-bg: "#fee2e2"
  semantic-error: "#dc2626"
  semantic-error-text: "#991b1b"
  semantic-info-bg: "#dbeafe"
  semantic-info-text: "#1e40af"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  full: "9999px"
  xl: "12px"
  lg: "8px"
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.deep-forest-teal}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.teal-700}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "#dc2626"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-forest-teal}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  input-error:
    backgroundColor: "{colors.semantic-error-bg}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.xl}"
  badge-default:
    backgroundColor: "{colors.surface-sidebar}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: KaironTherapy

## 1. Overview

**Creative North Star: "The Careful Record"**

KaironTherapy is a clinical management tool built around the same values as the practitioners who use it: precision, care, and reliability. Every screen is a page in a well-kept patient record — organized, legible, nothing out of place. The design's job is to surface the right information at the right moment without demanding attention for itself.

The visual vocabulary is grounded rather than decorative. The Deep Forest Teal brand color anchors the system as trustworthy and calm. Neutral slate surfaces carry the data. Semantic colors (green, yellow, red) communicate status clearly, without visual noise. Motion is restrained to functional feedback — a spinner, a fade, a toast. There is no animation for its own sake.

This system explicitly rejects the aesthetic of hospital EHR software (Epic, Meditech) — the gray overload, tiny inputs, and form-nightmare density that makes practitioners feel like they're fighting the tool. It equally rejects consumer wellness aesthetics (pastel, oversized whitespace, spa-app softness) and generic SaaS minimalism (blue-accent monotony, Notion-clone structure). KaironTherapy is a professional tool with warmth — not a startup, not a hospital, not an app store product.

**Key Characteristics:**
- Teal-anchored, slate-neutral palette — warm professional without being corporate blue
- Information density calibrated to clinical workflows — structured but not overwhelming
- Tactile and confident interactions — clear hover states, visible focus rings, immediate feedback
- Flat-with-structure elevation — borders and subtle shadows distinguish layers without depth theater
- A single font family (Inter) with weight + size contrast carrying all hierarchy

## 2. Colors: The Careful Palette

One dominant brand color anchors the system; everything else is a careful neutral or a semantic signal.

### Primary
- **Deep Forest Teal** (`#0f5c5c`): The brand's center of gravity. Used on primary buttons, active nav states, the logo mark, focus rings, and interactive text links. It is grounded and trustworthy without being corporate. Never used decoratively; every application is functional.
- **Teal 700** (`#126f6f`): Hover state for primary buttons and active interactive elements. One step lighter than the anchor.
- **Teal 500** (`#1a9e9e`): Focus ring tint; used with opacity in dark-mode ghost states.
- **Teal 50** (`#e6fafa`): Ghost button hover background, tinted well backgrounds on KPI cards. Keeps the brand present without competing with content.

### Neutral
- **Ink Primary** (`#1e293b`): Body text, headings, all high-importance labels. Strong enough to read at 14px.
- **Ink Secondary** (`#475569`): Secondary text, form labels, table column headers at full-weight.
- **Ink Muted** (`#94a3b8`): Placeholder text, disabled states, metadata. Never used for body-size copy — contrast fails at small sizes on white.
- **Surface White** (`#ffffff`): Page background, card backgrounds, input backgrounds.
- **Surface Sidebar** (`#f1f5f9`): Sidebar navigation background, table header background in some contexts. Creates a soft visual layer without a heavy shadow.
- **Surface Table Head** (`#f8fafc`): Table header rows. Lighter than sidebar; keeps table chrome visually quiet.
- **Border Default** (`#e2e8f0`): Dividers, card borders, section separators. The primary structural line weight.
- **Border Strong** (`#cbd5e1`): Input borders at rest; form field boundaries where a slightly stronger line reads better.

### Semantic
Semantic colors are reserved exclusively for status communication. They are never used for decoration.

- **Success** (`#dcfce7` bg / `#166534` text): Sesiones `realizada`, positive stock states, success toasts.
- **Warning** (`#fef9c3` bg / `#854d0e` text): Sesiones `pendiente`, low-stock proximity alerts.
- **Error** (`#fee2e2` bg / `#dc2626` primary / `#991b1b` text): Sesiones `cancelada`, stock bajo badges, destructive button, form field errors, error toasts.
- **Info** (`#dbeafe` bg / `#1e40af` text): Sessions-of-month KPI card; informational badges.

**The Signal Rule.** Semantic colors (green, yellow, red, blue) communicate status — and only status. Never apply them to decorative elements, section backgrounds, or brand moments. Their rarity is what makes them readable at a glance.

**The One Anchor Rule.** Deep Forest Teal (`#0f5c5c`) is the only accent color in the system. If you reach for another brand hue "for variety," that is a signal something is wrong with the information hierarchy, not a signal to add a second accent.

## 3. Typography

**Body/Display Font:** Inter (with system-ui, sans-serif fallback)

A single typeface family with deliberate weight contrast carries all typographic hierarchy. Inter's humanist proportions keep the system legible and warm without feeling geometric-cold. No display font is needed; clinical UI does not benefit from expressive type contrasts that compete with data.

**The One Family Rule.** Inter only. Weight, size, and color create all hierarchy. A second typeface would introduce visual noise with no functional payoff in a data-dense product.

### Hierarchy

- **Display** (700 weight, 1.5rem / 24px, -0.01em tracking, 1.25 line-height): Page-level headings only (`<h1>`). Appears once per screen — Dashboard title, page names. Never used inside cards or modals.
- **Headline** (600 weight, 1.125rem / 18px, 1.35 line-height): Section titles within a page, modal titles, tab-panel headings.
- **Title** (600 weight, 0.875rem / 14px, 1.4 line-height): Card headings, table row primary values, entity names in lists.
- **Body** (400 weight, 0.875rem / 14px, 1.5 line-height): All content copy, table cell data, form field values, description text. Cap line length at 65–75ch in prose contexts.
- **Label** (500 weight, 0.75rem / 12px, uppercase, 0.05em tracking, 1.4 line-height): Table column headers, metadata, form labels, badge text. Uppercase only at this scale and weight — never used for body copy.

**The No-Uppercase-Body Rule.** Uppercase is for labels (12px, 500 weight, tracked) and badges only. Body text, headings, and button labels are sentence case. All-caps at body size degrades readability in a scanning-heavy clinical context.

## 4. Elevation

KaironTherapy uses border-first elevation: surfaces are distinguished by subtle borders and background shifts, not by shadows. Shadows appear only when something genuinely floats above the content layer — a modal, a card on hover, a dropdown.

**The Flat-By-Default Rule.** Cards rest flat against the page with a border (`#e2e8f0`, 1px solid) and a white background. A shadow appears only on hover or when a surface is interactive. Modals and overlays earn their shadow by being genuinely above the page.

### Shadow Vocabulary
- **Card rest**: no shadow (border only). Background: `#ffffff`.
- **Card hover** (`box-shadow: 0 4px 12px rgba(0,0,0,0.08)`): Applied to clickable cards on hover, signaling interaction.
- **Card structural** (`box-shadow: 0 1px 3px rgba(0,0,0,0.06)`): `shadow-sm` — applied to data containers (table wrappers, inset panels) that need a soft lift without hover interaction.
- **Modal** (`box-shadow: 0 25px 50px rgba(0,0,0,0.25)`): `shadow-2xl` — the highest elevation. Always paired with a `bg-black/40 backdrop-blur-sm` overlay to reinforce depth.

### Dark Mode Elevation
In dark mode, border color shifts to `#334155` (slate-700) and card backgrounds to `#1e293b` (slate-800) or `#0f172a` (slate-900). Shadows are naturally absorbed and play a smaller role; tonal contrast via background steps carries depth.

## 5. Components

### Buttons

Tactile and confident — visible hover states, immediate feedback, no passive actions.

- **Shape:** Gently rounded (8px radius / `rounded-lg`). Not pill-shaped; that reads consumer-app.
- **Primary** (`bg-primary-800 → #0f5c5c`, white text, `px-4 py-2`, 14px 500-weight): Default action trigger. Hover: `#126f6f`. Focus: 2px ring, `#1a9e9e`, 1px offset. Transitions: 150ms ease.
- **Secondary** (white bg, `border #cbd5e1`, `#334155` text): Use for non-destructive secondary actions alongside a primary. Hover: `#f8fafc` bg.
- **Danger** (`bg-red-600 → #dc2626`, white text): Destructive actions only (delete, deactivate). Always paired with a `ConfirmDialog` before execution.
- **Ghost** (transparent bg, `#0f5c5c` text): Low-visual-weight actions — "Ver todas →", inline triggers. Hover: `#e6fafa` bg tint.
- **Loading state:** Spinner replaces content inline; button disabled at 50% opacity with `cursor-not-allowed`.

**The Confirm Before Delete Rule.** Every `danger` button must be preceded by a `ConfirmDialog`. No destructive action fires on first click.

### Badges / Status Chips

Round pills (9999px radius) at `text-xs` (12px) with a colored dot option for session states.

- **Session states**: `realizada` → green (`#dcfce7` bg, `#166534` text, `#22c55e` dot); `pendiente` → yellow; `cancelada` → red.
- **Stock bajo**: red bg + ⚠ icon. Dot not used here; the icon carries the meaning.
- **Teal badge**: `#e6fafa` bg, `#0f5c5c` text — brand-tinted for category labels.
- **Slate badge**: `#f1f5f9` bg, `#475569` text — neutral, default.

### Cards / Containers

- **Corner style:** Rounded XL (12px / `rounded-xl`). Inputs and buttons are rounded-lg (8px); cards are rounded-xl. The step difference establishes a clear component vs. container hierarchy.
- **Background:** White (`#ffffff`) on the light page background.
- **Shadow:** None at rest; `shadow-sm` for structural containers; `shadow-md` on hover for clickable cards.
- **Border:** 1px solid `#e2e8f0` (slate-200). The primary layer signal.
- **Internal padding:** `px-6 py-4` for content panels (modals, sections); `px-4 py-3` for table cells and compact row items; `p-5` for KPI cards.

**The No-Nested-Cards Rule.** Cards do not nest. A card inside a card signals that the information architecture needs restructuring, not a `rounded-xl shadow-sm` wrapper.

### Inputs / Fields

- **Style:** Rounded-lg (8px), white bg, `border #cbd5e1` at rest. `text-sm` (14px), `#1e293b` text.
- **Focus:** 2px ring `#1a9e9e` (teal-500), `border-primary-500` shift. No glow — ring only.
- **Error:** `border-red-400` + `bg-red-50`; error message below in `text-xs text-red-600`.
- **Disabled:** `bg-slate-50`, `text-slate-500`, `cursor-not-allowed` via opacity-50.
- **Labels:** `text-sm font-medium text-slate-700`, always above the field. Required fields marked with `text-red-500` asterisk.
- **Placeholder:** `#94a3b8` (slate-400). Sufficient contrast on white; never used as a substitute for a label.

### Navigation (Sidebar)

- **Background:** `#f1f5f9` (slate-100) — soft separation from white content area.
- **Nav items:** `text-sm font-medium`, `px-3 py-2.5`, `rounded-lg`. Icon (emoji, 1.25rem) + label.
- **Active state:** `bg-primary-800 text-white` — the strongest visual signal; only one item active at a time.
- **Hover state:** `bg-slate-200 text-slate-900` — understated; doesn't compete with active.
- **User info:** `text-xs` at bottom, name + role. Role shown `capitalize`.
- **Logo:** `w-8 h-8 bg-primary-800 rounded-lg` mark with "K" in white; brand name in `text-sm font-bold text-primary-800`.

### Tables

The primary data display pattern. Flat, structured, scannable.

- **Header row:** `bg-slate-50` bg, `text-xs font-semibold text-slate-600 uppercase tracking-wide`. Separated from body by `border-b border-slate-200`.
- **Body rows:** `text-sm`, divided by `divide-y divide-slate-100`. Hover: `bg-slate-50`.
- **Container:** `rounded-xl border border-slate-200 overflow-hidden`. No separate card wrapper needed; the table container IS the card.
- **Cell padding:** `px-4 py-3`.

**The Scannable Row Rule.** Primary entity name goes in the first column as `font-medium text-slate-700`. Secondary metadata uses `text-slate-500`. Status badge always in the last data column. No column should be decorative.

### Modals / Dialogs

- **Backdrop:** `bg-black/40 backdrop-blur-sm` — the blur distinguishes modal from a simple overlay.
- **Panel:** White, `rounded-xl shadow-2xl`. Header `px-6 py-4 border-b border-slate-200`; body `px-6 py-4 overflow-y-auto flex-1`.
- **Title:** `text-lg font-semibold text-slate-900`. Close button: `✕`, `text-slate-400 hover:text-slate-600`.
- **Size variants:** sm (max-w-md) for confirms; md (max-w-lg) for forms; lg (max-w-2xl) for detail views; xl (max-w-4xl) for rich content.
- **ESC closes.** Backdrop click closes. Both are required behaviors.

## 6. Do's and Don'ts

### Do:

- **Do use Deep Forest Teal (`#0f5c5c`) for primary actions, active nav states, and focus rings only.** Its restraint is the point; overuse dilutes trust.
- **Do pair every badge color with text** (not color alone) — a dot or an icon alongside the label so color-blind users get the same signal.
- **Do show a `ConfirmDialog` before every destructive mutation.** "Danger" variant button click alone is not enough.
- **Do use `rounded-xl` for containers (cards, modals) and `rounded-lg` for interactive elements (buttons, inputs).** The size difference signals hierarchy.
- **Do keep table headers in `uppercase text-xs tracking-wide` and body cells in `text-sm` with no case transformation.** The contrast carries the column/data distinction.
- **Do add a visible focus ring (2px, `#1a9e9e`) on all interactive elements.** Keyboard navigation is a clinical workflow reality.
- **Do use `text-wrap: balance` on `h1`–`h2` page headings** to prevent orphaned single-word last lines on narrow screens.

### Don't:

- **Don't use the EHR gray aesthetic** — dense gray forms, tiny unlabeled inputs, overwhelming tables with no visual hierarchy. This is the primary anti-reference. If a screen looks like it belongs in Meditech, redesign it.
- **Don't use consumer wellness aesthetics** (Headspace, Calm style) — pastel backgrounds, oversized whitespace, rounded-2xl everything, decorative illustrations. KaironTherapy is a professional tool, not a wellness product.
- **Don't apply generic SaaS minimalism** (Notion/Linear all-white + blue accent). The brand is teal, grounded, warm — not blue, cold, and sparse.
- **Don't use `border-left` or `border-right` greater than 1px as a colored accent stripe** on cards, callouts, or list items. Use background tints, leading icons, or full borders instead.
- **Don't apply gradient text** (`background-clip: text` + gradient). A single solid color, weight, or size change carries emphasis without decoration.
- **Don't nest cards.** A `rounded-xl border shadow-sm` inside another `rounded-xl border` is always wrong. Restructure the information hierarchy instead.
- **Don't use `#94a3b8` (ink-muted / slate-400) for body-size text on white backgrounds.** Contrast fails below 14px. Muted gray is reserved for metadata in `text-xs` or clearly secondary information.
- **Don't use uppercase for body copy or button labels.** Uppercase is reserved for `text-xs` table headers and badge labels only. Sentence case everywhere else.
- **Don't add section eyebrows (small all-caps kickers above every heading).** Table headers already use uppercase. Adding kicker labels above section headings reproduces the EHR cluttered-label aesthetic this system explicitly rejects.
