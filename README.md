# Animal Manager

A comprehensive web application for tracking and managing your animals' health records, growth, and basic information. Perfect for managing horses, dogs, cats, and many other species including exotic animals.

## Features

- **Animal Profiles**: Complete profiles with photos, birth dates, breeds, and basic information
- **Health Tracking**: Track weights, heights, medical records, and vaccination schedules
- **Multi-Species Support**: Built-in support for horses, dogs, cats, pigs, goats, llamas, alpacas, ferrets, parrots, birds of prey, and more
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Secure**: Firebase Authentication and Firestore database for secure data storage
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage (for profile pictures)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project set up
- Git for version control

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd animal-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration values in the `.env` file.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication and choose Email/Password as a sign-in method
4. Create a Firestore database
5. Enable Storage for profile pictures
6. Copy your Firebase config and add it to your `.env` file

### Deployment

The easiest way to deploy Animal Manager is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Project Structure

```
animal-manager/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── animals/           # Animal management pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase configuration
│   ├── auth-context.tsx  # Authentication context
│   ├── firestore.ts      # Firestore database functions
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
│   └── animal.ts         # Animal-related types
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help setting up the application, please open an issue in the GitHub repository.