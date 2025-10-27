# WePro Frontend

A clean, modern Next.js application built with TypeScript and Tailwind CSS.

## Features

- ✅ **Next.js 14** with Pages Router (`/src/pages` directory)
- ✅ **TypeScript** with strict configuration
- ✅ **Tailwind CSS** with typography plugin
- ✅ **ESLint & Prettier** configured for TypeScript and Next.js
- ✅ **Mobile-first** responsive design
- ✅ **Dark mode** support
- ✅ **Production-ready** setup

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd wepro-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
wepro-frontend/
├── src/
│   ├── pages/             # Next.js Pages Router
│   │   ├── _app.tsx       # App wrapper component
│   │   ├── _document.tsx  # Document wrapper component
│   │   └── index.tsx      # Homepage
│   ├── components/        # Reusable components (to be added)
│   ├── lib/               # Utility functions (to be added)
│   └── styles/            # Global styles with Tailwind
├── public/                # Static assets (to be added)
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Configuration

### Tailwind CSS

- Configured with typography plugin
- Custom color variables for dark mode support
- Mobile-first responsive utilities

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/*`)
- Next.js types included

### ESLint & Prettier

- Next.js recommended rules
- TypeScript support
- Prettier integration
- Consistent code formatting

## Deployment

The application is ready for deployment on platforms like:

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any platform supporting Node.js

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Write TypeScript for all new components
3. Use Tailwind CSS for styling
4. Ensure mobile-first responsive design

## License

This project is licensed under the MIT License.
