# ETMS 3.0 - Employee Timesheet Management System

A modern, responsive Employee Timesheet Management System built with React and Vite.

## Features

- **Pixel-perfect Dashboard**: Replicates the design exactly as specified
- **Responsive Design**: Fully responsive on mobile, tablet, and desktop
- **Modern UI**: Clean and intuitive user interface
- **Security Best Practices**: Built with security in mind

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **CSS3**: Separate CSS files for maintainability
- **ESLint**: Code quality and security linting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
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

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Left sidebar navigation
│   ├── Sidebar.css
│   ├── Header.jsx        # Top header with user info
│   ├── Header.css
│   ├── Dashboard.jsx     # Main dashboard content
│   └── Dashboard.css
├── App.jsx              # Main app component
├── App.css              # App layout styles
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Security Features

- No inline event handlers with user input
- Proper use of React's built-in XSS protection
- Secure component structure
- No eval() or dangerous code execution
- Proper input sanitization ready for backend integration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private - ECEWS Internal Use
