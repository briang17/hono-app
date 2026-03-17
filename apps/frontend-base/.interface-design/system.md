# Design System

## Direction & Feel

**Intent:** Busy professionals who need clarity without clutter — quick scans, fast updates, calm workspace

**Product Domain:** Task management tool for organizing work, tracking progress, and managing priorities

## Color Strategy

### Palette
- **Primary:** Neutral grays for structure (background, foreground, muted)
- **Semantic:**
  - `success` - Completion signals (done status, low priority)
  - `warning` - Medium priority, attention needed
  - `info` - In-progress status
  - `destructive` - High priority, errors, delete actions
- **Base colors:** Light grays for canvas, slightly darker for inputs (inset pattern)

### Usage Rules
- Use semantic colors for meaning (status, priority, actions)
- Use neutrals for structure (borders, backgrounds)
- One accent per component — multiple accents dilute focus
- Color carries meaning, not decoration

## Depth Strategy

**Approach:** Borders-only with subtle focus rings

### Surface Elevation
- Base: `bg-background`
- Inset (inputs): `bg-input` (darker than surroundings)
- Elevated: `bg-background` with `ring-1 ring-border` or `ring-foreground/10`
- Focus: `ring-2 ring-ring ring-offset-2 ring-offset-background`

### Border Progression
1. Standard: `border-border` (subtle separation)
2. Emphasis: `ring-1 ring-foreground/10` (cards)
3. Focus: `ring-2 ring-ring` (interactive elements)

### Rules
- No heavy shadows — whisper-quiet elevation
- Darker backgrounds for inputs (receiving content)
- Lighter backgrounds for interactive elements (hover states)
- Consistent opacity: `/10` for subtle, `/20` for visible

## Typography

### Typeface: Inter Variable
- **Headings:** `font-bold tracking-tight`
- **Labels:** `text-sm font-medium`
- **Body:** `text-base`
- **Meta:** `text-sm text-muted-foreground`

### Hierarchy
- Page title: `text-3xl font-bold tracking-tight`
- Section title: `text-lg font-semibold text-muted-foreground`
- Card title: `text-base font-medium`
- Label: `text-sm font-medium`

## Spacing

### Base Unit: 4px
- Micro: `gap-1` (4px), `gap-2` (8px) — icon spacing, inline elements
- Component: `gap-3` (12px), `gap-4` (16px) — form fields, card internal
- Section: `gap-6` (24px), `gap-8` (32px) — page sections
- Major: `gap-12` (48px) — page-level separation

### Rules
- All spacing multiples of 4px
- Consistent padding: `p-4` for cards, `px-3 py-2` for inputs
- No random values — always from scale

## Component Patterns

### Select Dropdown
Custom select with styled trigger:
```tsx
<div className="relative">
  <select className="w-full h-10 px-3 pr-8 text-sm bg-input border-input border rounded-md appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring" />
  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
</div>
```

### Status/Priority Badges
```tsx
<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-[semantic]/10 text-[semantic] border-[semantic]/20">
  {label}
</span>
```

### Card Hover
```tsx
<Card className="hover:border-ring/30 transition-all duration-200">
```

### Empty States
```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center max-w-md">
    <div className="text-4xl mb-4">📋</div>
    <h3 className="text-lg font-semibold mb-2">Title</h3>
    <p className="text-muted-foreground mb-4">Description</p>
    <Button>Action</Button>
  </div>
</div>
```

## Border Radius

- Inputs/buttons: `rounded-md`
- Cards: `rounded-xl`
- Modals: `rounded-xl`
- Consistent rounding — no mixing sharp/soft

## Interaction States

All interactive elements need:
- **Default:** Base styles
- **Hover:** `hover:bg-accent` or `hover:border-ring/30` + `transition-all duration-200`
- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`

## Animation

- **Duration:** `duration-200` for micro-interactions
- **Easing:** Default (deceleration)
- **Transition:** `transition-all` or `transition-[property]`
- No spring/bounce in professional interfaces

## Dark Mode

- Borders: `ring-foreground/10` for separation
- Inputs: `bg-input` (darker inset)
- Semantic colors: Use `/10` opacity variants for backgrounds
- Same hierarchy system, inverted values

## Layout Patterns

### Page Structure
```tsx
<div className="space-y-8">
  <header>
    <h1 className="text-3xl font-bold tracking-tight">Title</h1>
    <p className="text-muted-foreground mt-1">Subtitle</p>
  </header>
  <main>{content}</main>
</div>
```

### Grid Layouts
- Cards: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Stats: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`
- Two-column: `grid gap-8 lg:grid-cols-2`

### Navigation
- Active: `bg-accent text-accent-foreground font-semibold`
- Hover: `hover:bg-accent hover:text-accent-foreground`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`

## Loading States

```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-muted-foreground">Loading...</div>
</div>
```

## Error States

```tsx
{field.state.meta.errors && (
  <p className="text-sm text-destructive">{error}</p>
)}
```

## Key Values

- Font: Inter Variable
- Base spacing: 4px
- Card padding: `p-4`
- Input height: `h-9` (md), `h-10` (lg)
- Button padding: `px-2.5 py-1` (md)
- Border radius inputs: `rounded-md`
- Border radius cards: `rounded-xl`
- Transition duration: `200ms`
