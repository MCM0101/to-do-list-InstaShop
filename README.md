# To-Do List App

A modern, responsive to-do list application built with React, TypeScript, and Tailwind CSS. This app helps you manage work processes and daily tasks with a beautiful, intuitive interface.

## Features

- 📅 Date navigation with calendar integration
- 🎯 Work process management
- ✅ Task completion tracking
- 📊 Progress visualization
- 💾 Local storage persistence
- 📱 Responsive design
- 🎨 Modern UI with gradients and animations

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This will create a `dist` folder with the production build.

## Firebase Hosting Deployment

### Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

### Deployment Steps

1. Initialize Firebase in your project (if not already done):
```bash
firebase init hosting
```

2. Update `.firebaserc` with your Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

3. Build the project:
```bash
npm run build
```

4. Deploy to Firebase:
```bash
firebase deploy
```

Your app will be available at `https://your-project-id.web.app`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── constants/          # App constants
├── mocks/              # Mock data
└── utils/              # Utility functions
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Lucide React** - Icons
- **Firebase Hosting** - Deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

