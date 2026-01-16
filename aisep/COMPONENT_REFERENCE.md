# AISEP UI Component Reference

## Component Architecture

```
App.jsx
└── MainLayout.jsx (3-column responsive grid)
    ├── TopBar.jsx (Mobile only, sticky top)
    ├── Sidebar.jsx (Desktop only, left navigation)
    │   ├── Logo
    │   ├── Navigation Items (Home, Explore, Advisors, Profile)
    │   └── "Post Project" CTA Button
    ├── Center Column (Main Feed)
    │   ├── FeedHeader.jsx (Sticky "Discover Startups" title)
    │   └── StartupCard.jsx (Repeating feed items)
    │       ├── Card Header
    │       │   ├── Avatar.jsx (Image or Letter Fallback)
    │       │   ├── Startup Name (Bold)
    │       │   ├── AI Score Badge
    │       │   ├── Username
    │       │   └── Timestamp
    │       ├── Industry & Stage Badges
    │       ├── Pitch Description (3-line clamp)
    │       ├── Premium Zone
    │       │   ├── Sensitive Data (Blurred if not premium)
    │       │   └── Lock Overlay with CTA
    │       └── Action Footer
    │           ├── Like Button
    │           ├── Message Button
    │           ├── Share Button
    │           └── Save/Bookmark Button
    ├── RightPanel.jsx (Desktop only, sticky widgets)
    │   ├── Top AI Startups Widget
    │   └── Trending Sectors Widget
    └── BottomNav.jsx (Mobile only, fixed bottom)
        ├── Home Icon
        ├── Search Icon
        ├── Advisors Icon
        └── Profile Icon
```

---

## Layout Dimensions

### Desktop (>1024px)
```
┌──────────────────────────────────────────────────────────┐
│                        TOPBAR (hidden)                    │
├─────────────┬────────────────────────┬──────────────────┤
│             │                        │                  │
│  SIDEBAR    │   MAIN FEED (Center)   │  RIGHT PANEL     │
│  (275px)    │   (flexible)           │  (290px)         │
│             │                        │                  │
│  ┌────────┐ │ ┌─────────────────────┐│┌────────────────┐│
│  │ Logo   │ │ │   Feed Header       │││ Top AI Startups││
│  │ AISEP  │ │ ├─────────────────────┤│├────────────────┤│
│  │        │ │ │                     │││ StartupCard#1  ││
│  │ Home   │ │ │ StartupCard (Feed)  │││ StartupCard#2  ││
│  │ Explore│ │ │ ┌─────────────────┐ │││ StartupCard#3  ││
│  │Advisors│ │ │ │ Startup Logo    │ │││                ││
│  │ Profile│ │ │ │ Finflow         │ ││├────────────────┤│
│  │        │ │ │ │ @finflow_ai     │ │││ Trending       ││
│  │ [Post  │ │ │ │ 2 hours ago     │ │││ #Fintech       ││
│  │Project]│ │ │ │ AI Score: 87    │ │││ #HealthTech    ││
│  │        │ │ │ ├─────────────────┤ │││ #DevTools      ││
│  └────────┘ │ │ │ Fintech • Series │ │││ #Blockchain    ││
│             │ │ │                 │ │││ #ComputerVision││
│             │ │ │ "AI-powered fin │ ││└────────────────┘│
│             │ │ │ planning platform"
│             │ │ │                 │ ││
│             │ │ │ ┌─────────────┐ │ ││
│             │ │ │ │ Revenue... │ │ ││ (Blurred text visible)
│             │ │ │ │ Funding... │ │ ││
│             │ │ │ │ Contact... │ │ ││
│             │ │ │ │ 🔒 Unlock  │ │ ││ (Lock overlay on top)
│             │ │ │ └─────────────┘ │ ││
│             │ │ │                 │ ││
│             │ │ │ ♥ Like • 💬 Message │
│             │ │ │ 🔗 Share • 🔖 Save  │
│             │ │ └─────────────────┘ │
│             │ │                     │
│             │ │ (More cards...)     │
│             │ │                     │
│             │ └─────────────────────┘│
│             │                        │
├─────────────┴────────────────────────┴──────────────────┤
│                  BOTTOM NAV (hidden)                     │
└──────────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────────────────┐
│ 🚀 AISEP        [☰ Menu]  TOPBAR   │  (sticky, 60px height)
├─────────────────────────────────────┤
│                                     │
│ ┌──────────────────────────────────┐│
│ │ Feed Header                      ││
│ ├──────────────────────────────────┤│
│ │                                  ││
│ │ StartupCard (Mobile layout)      ││
│ │ ┌──────────────────────────────┐ ││
│ │ │ 🔤F Finflow                  │ ││ (Avatar as colored circle)
│ │ │ @finflow_ai  2 hours ago      │ ││
│ │ │ AI Score: 87                 │ ││
│ │ │                              │ ││
│ │ │ Fintech • Series A           │ ││
│ │ │                              │ ││
│ │ │ "AI-powered financial        │ ││
│ │ │ planning platform that uses  │ ││
│ │ │ machine learning to opt..."  │ ││
│ │ │                              │ ││
│ │ │ ┌──────────────────────────┐ │ ││
│ │ │ │ Revenue... (blurred) 🔒  │ │ ││
│ │ │ │ Funding... (blurred)     │ │ ││
│ │ │ │ Contact... (blurred)     │ │ ││
│ │ │ │                          │ │ ││
│ │ │ │ Subscribe to View        │ │ ││
│ │ │ │ [Unlock Premium]         │ │ ││
│ │ │ └──────────────────────────┘ │ ││
│ │ │                              │ ││
│ │ │ ♥  Like  💬 Msg  🔗 Share  🔖 Save
│ │ └──────────────────────────────┘ ││
│ │                                  ││
│ │ (More cards...)                  ││
│ │                                  ││
│ └──────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ 🏠      🔍      👥      👤  BOTTOM  │  (fixed, 60px height)
│ Home  Search  Advisors Profile  NAV │
└─────────────────────────────────────┘
```

---

## Color Palette

```
Primary Blue:          #1d9bf0  (Actions, highlights, active states)
Text Black:            #0f1419  (Main text, headings)
Text Gray:             #536471  (Secondary text, descriptions)
Border Light:          #eff3f4  (Borders, dividers)
Background White:      #ffffff  (Main background)
Background Light Gray: #f7f9fa  (Card backgrounds, widgets)

AI Score Colors:
  Good (80+):   #17bf63  (Green)
  Medium (50-80): #ffad1f (Yellow/Orange)
  Poor (<50):   #e74c3c  (Red)

Hover States:
  Subtle blue:  rgba(29, 155, 240, 0.03)
  Pronounced blue: rgba(29, 155, 240, 0.1)
  Subtle dark:  rgba(0, 0, 0, 0.08)
```

---

## Startup Card Details

### Card Header Layout
```
┌─ Avatar ─┬─ Info ─────────────────────────────────┐
│ [Logo]   │ FinFlow              [AI Score: 87]    │
│  (48px)  │ @finflow_ai                            │
│          │ 2 hours ago                            │
└──────────┴────────────────────────────────────────┘
```

### Badge Styling
```
Industry Badge:          Gray background, Dark text
Stage Badge:             Gray background, Dark text  
AI Score Badge (Good):   Green background, White text
AI Score Badge (Medium): Orange background, White text
AI Score Badge (Poor):   Red background, White text
```

### Premium Zone Visual
```
┌──────────────────────────────────┐
│ Monthly Revenue: $125,000/month  │ ← Visible text
│ Funding Ask: $2M                 │   (when premium = true)
│ Contact: contact@finflow.ai      │
│                                  │
│ Monthly Revenue: $XX,███ (blur)  │ ← Blurry shapes
│ Funding Ask: $█.█M (blur)        │   (when premium = false)
│ Contact: cont███@company.com     │
│                                  │
│  ┌────────────────────────────┐  │
│  │      🔒 Lock Icon          │  │ ← Overlay
│  │   Subscribe to View        │  │
│  │   [Unlock Premium]         │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Action Button States
```
Default:     Gray icon, Gray text
Hover:       Blue icon, Blue text, Light blue background
Liked/Saved: Red/Blue icon (colored), Colored text, Colored background
```

---

## Avatar Fallback Logic

```javascript
/* If image loads successfully */
┌─────────┐
│ [Image] │
└─────────┘

/* If image fails or is placeholder */
┌─────────┐
│    F    │  ← First letter of startup name
└─────────┘     Colored background (generated from name)

Color palette for fallback:
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│   F    │ │   G    │ │   H    │ │   C    │
│ Red    │ │ Teal   │ │ Blue   │ │ Salmon │
└────────┘ └────────┘ └────────┘ └────────┘
```

---

## Responsive Breakpoints

### Desktop: `min-width: 1025px`
- 3-column layout (275px | 1fr | 290px)
- Sidebar visible and sticky
- Right panel visible and sticky
- Top bar hidden
- Bottom nav hidden

### Tablet: `768px - 1024px`
- Single column layout
- Sidebars hidden
- Full-width feed
- Top bar hidden
- Bottom nav hidden (can be added if needed)

### Mobile: `max-width: 768px`
- Single column layout
- Sidebars hidden
- Top bar visible and sticky (60px)
- Bottom nav visible and fixed (60px)
- Feed has bottom padding for nav clearance

---

## Spacing System

```
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 3rem   (48px)

Card padding:        md (16px)
Section gaps:        md to lg (16px - 24px)
Widget padding:      md (16px)
Action button gap:   6px (custom)
```

---

## Typography Scale

```
Font Family: System UI
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
  'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
  'Helvetica Neue', sans-serif

Font Sizes:
  xs:  0.75rem  (12px)
  sm:  0.875rem (14px)
  base: 1rem    (16px)
  lg:  1.125rem (18px)
  xl:  1.25rem  (20px)

Font Weights:
  Startup Name:  800 (Extra Bold)
  Section Titles: 700 (Bold)
  Labels:        700 (Bold)
  Body Text:     400-500 (Regular)
  Description:   400 (Regular)
```

---

## Key Implementation Details

### Sticky Positioning
```css
/* Sidebar & RightPanel */
position: sticky;
top: 0;
height: 100%;
overflow-y: auto;

/* FeedHeader */
position: sticky;
top: 0;
z-index: 5;  /* Below nav, above feed */
```

### Grid Layout
```css
/* Main Grid */
display: grid;
grid-template-columns: 275px 1fr 290px;
max-width: 1260px;
margin: 0 auto;

/* Data Grid (Premium Zone) */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
gap: 1rem;
```

### Text Clamping
```css
/* Pitch Description */
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
```

### Blur Effect
```css
/* Sensitive Data when not premium */
filter: blur(8px);
pointer-events: none;
user-select: none;

/* Overlay */
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.92));
```

---

This reference guide provides the complete visual and technical structure of the AISEP UI. All components follow this architecture consistently.
