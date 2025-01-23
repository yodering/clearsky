# ClearSky

ClearSky is a  web application for managing your Bluesky social media content. Provides an intuitive interface for bulk content management and timeline cleanup.

## Features

- **Mass Post Delete** - Efficiently delete multiple posts with a single click
- **Smart Filtering** - Filter posts by date, content, and media type
- **Batch Actions** - Select multiple items and perform actions in bulk
- **Secure Authentication** - Direct integration with Bluesky's official API
- **Privacy Focused** - No credential storage, all operations happen client-side

## Security

ClearSky takes your privacy and security seriously:

- Uses official Bluesky API (@atproto/api) for authentication
- Credentials are never stored on any servers
- All communication is direct between your browser and Bluesky's servers
- Sessions are stored locally and cleared on logout
- Supports app-specific passwords for enhanced security

## Getting Started

1. Visit the ClearSky web application
2. Click "Get Started"
3. Log in with your Bluesky credentials (we recommend using an app-specific password)
4. Start managing your content!

## Built With

- React
- TypeScript
- Tailwind CSS
- @atproto/api
- Zustand

