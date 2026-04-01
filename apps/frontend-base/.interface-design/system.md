# Design System

## Direction & Feel

**Intent:** Premium real estate workspace — warm luxury meets clean efficiency for managing properties, open houses, and leads

**Product Domain:** Real estate management tool for organizing properties, scheduling open houses, tracking viewings, and collecting potential buyer leads

## Color Strategy

### Palette
- **Primary:**
  - Real Estate Gold (`--re-gold`) - Primary accent, CTAs, badges, luxury feel
  - Real Estate Navy (`--re-navy`) - Headings, important info, professional/trustworthy
- **Semantic:**
  - `success` - Completion signals (done status, low priority)
  - `warning` - Medium priority, attention needed
  - `info` - In-progress status
  - `destructive` - High priority, errors, delete actions
- **Base colors:** Light grays for canvas, slightly darker for inputs (inset pattern)

### Usage Rules
- Use `re-gold` for primary actions, badges, accent borders, price highlights
- Use `re-navy` for page headings, important data points, property addresses
- Use semantic colors for status and meaning
- Use neutrals for structure (borders, backgrounds)
- Gold is the signature accent — use intentionally, not everywhere
- Navy for headings creates professional depth
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
4. Gold Accent: `border-l-4 border-l-re-gold` (lead cards, highlighted elements)

### Rules
- No heavy shadows — whisper-quiet elevation
- Darker backgrounds for inputs (receiving content)
- Lighter backgrounds for interactive elements (hover states)
- Consistent opacity: `/10` for subtle, `/20` for visible
- Gold left border (`border-l-4 border-l-re-gold`) is signature pattern for lead cards

## Typography

### Typeface: Roboto Variable
- **Headings:** `font-bold tracking-tight text-re-navy`
- **Labels:** `text-sm font-medium`
- **Body:** `text-base`
- **Meta:** `text-sm text-muted-foreground`
- **Price displays:** `text-2xl font-bold text-re-gold`

### Hierarchy
- Page title: `text-3xl font-bold tracking-tight text-re-navy`
- Section title: `text-lg font-semibold text-muted-foreground`
- Card title: `text-base font-medium text-re-navy`
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

### Property Card with Hero Image
```tsx
<Card className="overflow-hidden hover:shadow-lg hover:border-re-gold/30 transition-all duration-200 cursor-pointer group">
  <div className="relative h-48 overflow-hidden bg-muted">
    <img
      src={listingImageUrl || '/placeholder-property.jpg'}
      alt={propertyAddress}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    <div className="absolute top-3 right-3">
      <span className="px-3 py-1 text-xs font-medium text-white bg-re-navy rounded-full">
        {format(new Date(date), 'MMM d')}
      </span>
    </div>
  </div>
  <CardContent className="p-4 space-y-3">
    <h3 className="font-semibold text-base text-re-navy line-clamp-2">{propertyAddress}</h3>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-re-gold">{formatCurrency(listingPrice)}</span>
    </div>
    <div className="text-sm text-muted-foreground">
      {startTime} - {endTime}
    </div>
  </CardContent>
  <CardFooter className="p-4 pt-0">
    <Button variant="ghost" className="w-full justify-between hover:text-re-gold">
      View Details
      <ChevronRight className="h-4 w-4" />
    </Button>
  </CardFooter>
</Card>
```

### Lead Card with Gold Accent
```tsx
<Card className="border-l-4 border-l-re-gold hover:border-primary/40 transition-colors duration-200">
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between">
      <CardTitle className="text-base text-re-navy">
        {firstName} {lastName}
      </CardTitle>
      <Badge className={workingWithAgent ? "bg-re-gold text-re-gold-foreground" : "bg-muted text-muted-foreground"}>
        {workingWithAgent ? "Has Agent" : "No Agent"}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    {email && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Email:</span>
        <span className="text-foreground">{email}</span>
      </div>
    )}
    {phone && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Phone:</span>
        <span className="text-foreground">{phone}</span>
      </div>
    )}
    {/* Custom form responses — border separator, label:value rows */}
    <ResponseViewer responses={lead.responses} questions={questions} />
    <div className="pt-2 border-t border-border">
      <span className="text-muted-foreground text-xs">
        Signed in {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
      </span>
    </div>
  </CardContent>
</Card>
```

### Response Viewer (Custom Form Responses)
```tsx
{/* Renders within lead card, between contact info and timestamp */}
<div className="space-y-2 pt-2 border-t border-border">
  {entries.map(({ question, value }) => (
    <div key={question.id} className="flex justify-between gap-4">
      <span className="text-muted-foreground">{question.label}:</span>
      <span className="text-foreground text-right">{formatResponseValue(question, value)}</span>
    </div>
  ))}
</div>
```

Response value formatting:
- text/textarea/number → plain string
- select/radio → option label (not value)
- checkbox → comma-separated option labels
- date → formatted date string
- range → "min — max"

### Status/Priority Badges
```tsx
<span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-[semantic]/10 text-[semantic] border-[semantic]/20">
  {label}
</span>
```

### Empty States
```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center max-w-md">
    <div className="text-4xl mb-4">🏠</div>
    <h3 className="text-lg font-semibold mb-2">Title</h3>
    <p className="text-muted-foreground mb-4">Description</p>
    <Button>Action</Button>
  </div>
</div>
```

## Border Radius

- Inputs/buttons: `rounded-md`
- Cards: `rounded-xl`
- Hero images: `rounded-t-xl` (top only when in card)
- Modals: `rounded-xl`
- Consistent rounding — no mixing sharp/soft

## Interaction States

All interactive elements need:
- **Default:** Base styles
- **Hover:** `hover:bg-accent` or `hover:border-re-gold/30` + `transition-all duration-200`
- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`

## Animation

- **Duration:** `duration-200` for micro-interactions, `duration-300` for image zoom
- **Easing:** Default (deceleration)
- **Transition:** `transition-all` or `transition-[property]`
- No spring/bounce in professional interfaces

## Dark Mode

- Borders: `ring-foreground/10` for separation
- Inputs: `bg-input` (darker inset)
- Semantic colors: Use `/10` opacity variants for backgrounds
- Gold/Navy: Same colors, adjust foreground for contrast
- Same hierarchy system, inverted values

## Layout Patterns

### Page Structure
```tsx
<div className="space-y-8">
  <header>
    <h1 className="text-3xl font-bold tracking-tight text-re-navy">Title</h1>
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

- Font: Roboto Variable
- Base spacing: 4px
- Card padding: `p-4`
- Input height: `h-9` (md), `h-10` (lg)
- Button padding: `px-2.5 py-1` (md)
- Border radius inputs: `rounded-md`
- Border radius cards: `rounded-xl`
- Transition duration: `200ms`
- Gold accent: `border-l-4 border-l-re-gold` (signature pattern)
- Price color: `text-re-gold` and font-bold
- Heading color: `text-re-navy`

## Signature Elements

1. **Gold left border on lead cards** - `border-l-4 border-l-re-gold`
2. **Property hero images** - Full-width, rounded top, hover zoom effect
3. **Gold price displays** - `text-2xl font-bold text-re-gold`
4. **Navy headings** - `text-re-navy` for professional depth
5. **Gold accent badges** - Primary actions, status indicators
