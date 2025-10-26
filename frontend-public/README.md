# PSC 119 - Public Reporting Web

🚑 Lightweight public-facing web application for emergency reporting without authentication.

## Features

- ✅ Submit emergency reports without login
- 📸 Photo upload support
- 📍 Automatic GPS location capture
- 🔍 Track report status by phone number
- 📱 Mobile-responsive design
- ⚡ Fast and lightweight (Vite + React)

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js v16+
- Backend API running on `http://localhost:8080`

### Installation

```bash
cd frontend-public
npm install
```

### Development

```bash
npm run dev
```

App will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Build output will be in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create `.env` file (optional):

```env
VITE_API_URL=http://localhost:8080/api
```

## Pages

### Home Page (`/`)
- Hero section with emergency call-to-action
- Features overview
- How it works section

### Report Page (`/report`)
- Emergency report form
- Photo upload
- GPS location capture
- Category selection

### Track Page (`/track`)
- Search reports by phone number
- View report status timeline
- See assigned team details

## Components

- `Header` - Navigation and branding
- `Footer` - Contact info and links
- Page components in `/src/pages`

## API Integration

All API calls are in `/src/services/api.js`:

- `reportAPI.createReport(formData)` - Submit new report
- `reportAPI.trackByPhone(phone)` - Track reports
- `categoryAPI.getAll()` - Get categories

## Customization

### Colors

Edit `tailwind.config.js` to customize color scheme:

```js
colors: {
  primary: { ... },
  emergency: { ... }
}
```

### Branding

Update `Header.jsx` and `Footer.jsx` for branding.

## License

ISC
