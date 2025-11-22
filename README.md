# Las Fuertes Landing Page

A modern, responsive landing page built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Next.js 16.0.1** - React framework for production
- **React 19.2.0** - UI library
- **TypeScript 5.8.3** - Type safety
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Node.js 24.11.0 LTS** - Runtime environment

## 📋 Prerequisites

- Node.js 24.11.0 LTS or higher
- npm 11.6.1 or higher

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables (if needed):

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🌍 Internationalization

The project supports multiple languages:

- Spanish (es) - Default
- English (en)
- French (fr)

Language detection is automatic based on the browser's `Accept-Language` header.

## 🎨 Styling

This project uses a hue-based Tailwind color system.
Colors are organized by their base hue (blue, purple, red, etc.) and use numeric shade keys following Tailwind conventions.

To expand the palette, follow the same convention:

- Add a DEFAULT hex for the hue

- Optionally add numeric variants (100, 300, 700, 900, etc.)

- Keep shade numbers consistent across hues (lighter → higher number OR vice-versa — whichever your team standardizes)

Example:

```json
green: {
  DEFAULT: '#00A676',
  '700': '#33C79B',
  '300': '#007456',
},
```

Custom fonts:

- DM Sans (primary font)

## 📁 Project Structure

```
landing/
├── components/          # React components
│   └── coming-soon/    # Coming soon component
├── hooks/              # Custom React hooks
├── locales/            # Translation files
├── pages/              # Next.js pages
├── public/             # Static assets
├── styles/             # Global styles
└── ...
```

## 🔧 Configuration

### TypeScript

Strict mode is enabled for better type safety. Configuration in `tsconfig.json`.

### ESLint & Prettier

Code quality is enforced with ESLint and Prettier. Configuration files:

- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules

### Next.js

Configuration in `next.config.js`:

- React Strict Mode enabled
- i18n support for multiple languages
- Image optimization enabled
- Console logs removed in production (except errors/warnings)

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Static Export

For static export, update `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
  // ... other config
};
```

Then:

```bash
npm run build
```

The static files will be in the `out/` directory.

## 📝 License

ISC
