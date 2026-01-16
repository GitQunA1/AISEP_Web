# AISEP MVP Homepage - Project Setup Complete ✅

## Project Overview
A **Twitter/X-like Feed** displaying **Startup Profiles** with AI scoring, premium content blur, and responsive design.

## Technology Stack
- **Framework**: React (Create React App)
- **Styling**: CSS Modules + CSS Variables (NO Tailwind)
- **Icons**: lucide-react
- **State Management**: React Hooks (useState)

---

## Project Structure

```
src/
├── assets/                    # Images, logos, media files
├── components/
│   ├── common/                # Reusable UI components
│   │   ├── Avatar.jsx         # Profile/Logo display
│   │   ├── Badge.jsx          # Status badges (industry, stage, AI score)
│   │   └── Button.jsx         # Reusable button component
│   ├── layout/                # Page layout components
│   │   ├── MainLayout.jsx     # Main container - handles 3-column grid
│   │   ├── Sidebar.jsx        # Desktop left navigation
│   │   ├── RightPanel.jsx     # Desktop right widgets (trending/top rated)
│   │   ├── TopBar.jsx         # Mobile top header
│   │   └── BottomNav.jsx      # Mobile bottom navigation
│   └── feed/                  # Feed-specific components
│       ├── FeedHeader.jsx     # Feed title section
│       └── StartupCard.jsx    # Individual startup card (main component)
├── config/
│   └── config.js              # Environment configuration
├── data/
│   └── mockStartups.js        # Mock startup data (5 startups)
├── styles/
│   ├── variables.css          # CSS variables (colors, spacing, typography)
│   └── global.css             # Global styles & reset
├── App.jsx                    # Root component
├── index.js                   # Entry point
└── index.css                  # Base CSS

.env                           # Environment variables
package.json                   # Dependencies
```

---

## Key Features Implemented

### 1. **Responsive Design**
- **Desktop (>1024px)**: 3-Column Grid Layout
  - Left Sidebar (25%): Navigation + CTA
  - Center Column (50%): Main Feed
  - Right Panel (25%): Trending/Top Startups
  
- **Tablet (769-1024px)**: Single column, sidebars hidden
  
- **Mobile (<768px)**: 
  - Single column feed (100% width)
  - Top Bar with logo (sticky)
  - Bottom Navigation bar (fixed)

### 2. **StartupCard Component**
Each card displays:
- **Header**: Logo, Name, AI Score Badge, Username, Timestamp
- **Industry & Stage**: Pill-shaped badges
- **Pitch**: 3-line text clamp
- **Premium Zone**: Revenue, Funding Ask, Email (with blur overlay when not premium)
- **Actions**: Like, Message, Share, Save buttons

### 3. **Premium Content Blur**
- `isPremium = false` (hardcoded)
- Sensitive data overlaid with `backdrop-filter: blur(12px)`
- Lock icon + "Subscribe to View" CTA button

### 4. **Design System**
- **Colors**: Primary Blue (#1d9bf0), Text Black (#0f1419), Border Light (#eff3f4)
- **AI Score Colors**: Green (80+), Yellow (50-80), Red (<50)
- **Typography**: System UI fonts, consistent sizing
- **Spacing & Radius**: CSS variables for consistency

---

## Mock Data Structure

Each startup has:
```javascript
{
  id: number,
  name: string,
  logo: string (image URL),
  username: string,
  timestamp: string,
  industry: string,
  stage: string,
  description: string,
  aiScore: number (0-100),
  sensitiveData: {
    revenue: string,
    fundingAsk: string,
    email: string,
    blockchainHash: string
  }
}
```

5 mock startups included:
1. **FinFlow** - Fintech, Series A, AI Score: 87
2. **HealthMind** - HealthTech, Seed, AI Score: 72
3. **CodeGenie** - DevTools, MVP, AI Score: 58
4. **GreenChain** - Blockchain, Series B, AI Score: 91
5. **VisionAI Lab** - Computer Vision, Seed, AI Score: 42

---

## CSS Architecture

### Variables (src/styles/variables.css)
- **Colors**: `--primary-blue`, `--text-black`, `--border-light`, `--score-good/medium/poor`
- **Typography**: `--font-main`, `--font-size-*`
- **Spacing**: `--spacing-xs` through `--spacing-2xl`
- **Effects**: `--blur-overlay`, transitions, shadows
- **Borders**: `--radius-sm` through `--radius-full`

### Global Styles (src/styles/global.css)
- CSS reset
- Base typography
- Scrollbar styling
- Button & link defaults

### CSS Modules
Each component has its own `.module.css` file for scoped styling:
- `StartupCard.module.css` - Card layout, premium zone, actions
- `MainLayout.module.css` - Grid, responsive breakpoints
- `Sidebar.module.css`, `RightPanel.module.css` - Desktop sidebars
- `TopBar.module.css`, `BottomNav.module.css` - Mobile navigation

---

## Getting Started

### Start Development Server
```bash
npm start
```
App runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Environment Variables
Edit `.env`:
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

---

## Responsive Breakpoints

- **Mobile**: `max-width: 768px` - Hides sidebars, shows top/bottom nav
- **Tablet**: `max-width: 1024px` - Single column, no sidebars
- **Desktop**: `min-width: 1025px` - Full 3-column grid

---

## Next Steps for Development

1. **Connect to Backend API**: Update `config.js` with real API endpoints
2. **Implement React Router**: Add multi-page navigation
3. **Add State Management**: Consider Redux/Context for global state
4. **User Authentication**: Add login/signup flows
5. **Dynamic Data**: Replace mock data with API calls
6. **Advanced Features**: 
   - Search & filters
   - Startup detail pages
   - User profiles
   - Admin dashboard

---

## Notes

- **No TypeScript**: Pure JavaScript/JSX only
- **No Tailwind**: All styling via CSS Modules + Variables
- **No Bootstrap**: Custom responsive design
- **Icons**: All from lucide-react
- **Accessibility**: ARIA labels where applicable

Enjoy building! 🚀
