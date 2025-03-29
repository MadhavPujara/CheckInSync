# Check-in Helper

A React Native mobile app that helps you check in to Zoho People and notify your team on Basecamp with a single tap.

## Features

- One-tap check-in to Zoho People with location
- Automatic team notification in Basecamp Campfire
- Material Design UI with dark mode support
- Secure credential storage using expo-secure-store
- Easy configuration through settings UI

## Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)
- Expo CLI

## Setup & Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd check-in-helper
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

## Running on Android/iOS

1. Install Expo Go on your device or start an emulator
2. Scan the QR code from the terminal after running `npm start`
3. Or run directly on emulator/simulator:

   ```bash
   npm run android
   # or
   npm run ios
   ```

## Project Structure

```text
check-in-helper/
├── app/                    # Main application code
├── src/                    # Source code
├── scripts/               # Build and utility scripts
├── assets/                # Static assets
├── docs/                  # Documentation
├── jest.setup.js         # Test configuration
├── tsconfig.json         # TypeScript configuration
├── app.json              # Expo configuration
└── package.json          # Project dependencies
```

## Configuration

On first launch, you'll need to configure:

### Zoho People API

- Client ID
- Client Secret
- Refresh Token

### Basecamp API

- Access Token
- Account ID
- Project ID
- Campfire ID

These can be updated anytime through the Settings menu.

## Development

- Built with Expo SDK 52
- Uses React Native Paper for Material Design components
- Implements Expo Router for navigation
- Uses expo-secure-store for secure credential storage
- TypeScript support
- Jest for testing

## Key Dependencies

- expo: ~52.0.41
- react: 18.3.1
- react-native: 0.76.7
- react-native-paper: ^5.13.1
- expo-router: ~4.0.19
- expo-secure-store: ~14.0.1
- expo-location: ^18.0.8
- axios: ^1.8.4

## Available Scripts

- `npm start` - Start development server with tunneling
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run type-check` - Check TypeScript types
- `npm run version:major/minor/patch` - Version bumping

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
