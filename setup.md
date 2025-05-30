# ChurchConnect Flutter App - Setup Guide

This document contains all the commands and steps used to build the ChurchConnect - Welfare Ministry Mobile App using Flutter. Use this as a reference for building similar apps or recreating this project.

## 📋 Prerequisites

Before starting, ensure you have:

- Flutter SDK installed and configured
- Dart SDK
- Android Studio / Xcode (for mobile development)
- VS Code with Flutter extensions
- Git for version control

### Verify Flutter Installation

```bash
flutter --version
flutter doctor
```

## 🚀 Project Initialization

### 1. Project Setup (if creating from scratch)

```bash
# Navigate to project directory
cd /Users/hetawk/Documents/Coding_Env/native/messaging

# Create Flutter project (if starting fresh)
flutter create --project-name church_connect --org com.churchconnect .

# Or initialize in existing directory
flutter create .
```

### 2. Update pubspec.yaml Dependencies

The `pubspec.yaml` file was updated with comprehensive dependencies for:

- State Management (Riverpod)
- Navigation (GoRouter)
- UI Components (Material Design Icons, SVG, etc.)
- Database (SQLite)
- Authentication (Firebase)
- HTTP & API (Dio, Retrofit)
- File handling, Charts, Background tasks, etc.

### 3. Create Modular Directory Structure

```bash
# Create the complete modular architecture
cd /Users/hetawk/Documents/Coding_Env/native/messaging && mkdir -p lib/features/{authentication,member_care,messaging,automation,analytics,templates,organization}/{components,screens,services,models,providers} lib/shared/{components,services,providers,models,utils,constants,config,widgets} lib/core/{routing,theme,database} assets/{images,icons,fonts,data}
```

### 4. Install Dependencies

```bash
# Get all dependencies
flutter pub get

# Generate code (for Riverpod, Retrofit, JSON serialization)
flutter packages pub run build_runner build
```

### Install Flutter Dependencies

```bash
# Get all the dependencies defined in pubspec.yaml
flutter pub get

# Note: If there are dependency conflicts, we may need to update versions
# Check for dependency issues and resolve them
```

### Handle Dependency Issues

```bash
# If flutter pub get fails with version conflicts, update dependencies
flutter pub deps
flutter pub outdated

# Fix specific dependency issues (example: material design icons)
# Update pubspec.yaml to use: material_design_icons_flutter: ^7.0.7296
# instead of: flutter_material_design_icons: ^2.0.7
```

### Retry Dependencies Installation

```bash
# After fixing dependency issues, retry
flutter pub get

# If there are still conflicts, follow Flutter's suggestions:
# Example: Update form_builder_validators
flutter pub add form_builder_validators:^11.0.0

# Success! Dependencies should now be installed
# You should see: "Changed X dependencies!" message
```

## 3. Core Architecture Implementation

### Create Core Theme Configuration

```bash
# Create the main theme configuration file
# ✅ COMPLETED: lib/core/theme/app_theme.dart
```

### Create Routing Configuration

```bash
# Create the routing configuration with GoRouter
# ✅ COMPLETED: lib/core/routing/app_router.dart
```

### Update Main App Entry Point

```bash
# Update main.dart to use our ChurchConnect app structure
# ✅ COMPLETED: lib/main.dart
```

### Create Shared Models and Types

```bash
# Create core data models
touch lib/shared/models/user_model.dart
touch lib/shared/models/member_model.dart
touch lib/shared/models/message_model.dart
touch lib/shared/models/template_model.dart
```

## 🏗️ Architecture Overview

### Directory Structure Created

```
lib/
├── features/                    # Feature-based modules (DRY principle)
│   ├── authentication/
│   │   ├── components/          # UI components specific to auth
│   │   ├── screens/             # Authentication screens
│   │   ├── services/            # Auth business logic
│   │   ├── models/              # Auth data models
│   │   └── providers/           # Auth state management
│   ├── member_care/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── models/
│   │   └── providers/
│   ├── messaging/
│   ├── automation/
│   ├── analytics/
│   ├── templates/
│   └── organization/
├── shared/                      # Shared components and utilities (DRY)
│   ├── components/              # Reusable UI components
│   ├── services/                # Shared API services
│   ├── providers/               # Shared state management
│   ├── models/                  # Shared data models
│   ├── utils/                   # Helper functions
│   ├── constants/               # App-wide constants
│   ├── config/                  # Configuration files
│   └── widgets/                 # Reusable widgets
├── core/                        # Core app functionality
│   ├── routing/                 # Navigation configuration
│   ├── theme/                   # App theming
│   └── database/                # Database configuration
└── assets/                      # Static assets
    ├── images/
    ├── icons/
    ├── fonts/
    └── data/
```

## 🔧 Key Dependencies Used

### State Management

- `flutter_riverpod: ^2.4.9` - Modern state management
- `riverpod_annotation: ^2.3.3` - Code generation for Riverpod

### Navigation

- `go_router: ^12.1.3` - Declarative routing

### UI & Design

- `flutter_material_design_icons: ^2.0.7` - Material Design icons
- `flutter_svg: ^2.0.9` - SVG support
- `cached_network_image: ^3.3.0` - Image caching
- `shimmer: ^3.0.0` - Loading animations

### Database & Storage

- `sqflite: ^2.3.0` - Local SQLite database
- `shared_preferences: ^2.2.2` - Local key-value storage

### HTTP & API

- `dio: ^5.4.0` - HTTP client
- `retrofit: ^4.0.3` - Type-safe HTTP client

### Authentication

- `firebase_auth: ^4.15.3` - Firebase authentication
- `google_sign_in: ^6.1.6` - Google Sign-In

### Forms & Validation

- `flutter_form_builder: ^9.1.1` - Form builder
- `form_builder_validators: ^9.1.0` - Form validation

### File Handling

- `file_picker: ^6.1.1` - File picker
- `image_picker: ^1.0.4` - Image picker
- `csv: ^5.0.2` - CSV processing
- `excel: ^4.0.2` - Excel file processing

### Charts & Analytics

- `fl_chart: ^0.66.0` - Charts and graphs

### Background Tasks

- `workmanager: ^0.5.2` - Background job scheduling

## 🔨 Build Commands

### Development

```bash
# Run on debug mode
flutter run

# Run with hot reload
flutter run --hot

# Run on specific device
flutter run -d <device_id>

# Run web version
flutter run -d chrome
```

### Code Generation

```bash
# Generate code for annotations (Riverpod, Retrofit, JSON)
flutter packages pub run build_runner build

# Watch for changes and auto-generate
flutter packages pub run build_runner watch

# Clean and rebuild generated files
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run integration tests
flutter drive --target=test_driver/app.dart
```

### Building for Production

```bash
# Build APK for Android
flutter build apk --release

# Build App Bundle for Android (recommended for Play Store)
flutter build appbundle --release

# Build for iOS
flutter build ios --release

# Build for Web
flutter build web --release

# Build for macOS
flutter build macos --release

# Build for Windows
flutter build windows --release

# Build for Linux
flutter build linux --release
```

## 📱 Platform-Specific Setup

### Android Setup

```bash
# Accept Android licenses
flutter doctor --android-licenses

# Build debug APK
flutter build apk --debug

# Install on connected device
flutter install
```

### iOS Setup

```bash
# Clean iOS build
flutter clean && flutter pub get

# Build iOS
flutter build ios --release --no-codesign

# Open in Xcode
open ios/Runner.xcworkspace
```

### Web Setup

```bash
# Enable web
flutter config --enable-web

# Build web
flutter build web

# Serve locally
flutter run -d chrome
```

## 🔥 Firebase Setup

### 1. Firebase Project Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init
```

### 2. FlutterFire Setup

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase for Flutter
flutterfire configure
```

### 3. Add Firebase Configuration Files

- `android/app/google-services.json` - Android configuration
- `ios/Runner/GoogleService-Info.plist` - iOS configuration
- `lib/firebase_options.dart` - Generated Flutter configuration

## 📊 Database Setup

### SQLite Database Migrations

```bash
# Create migration files in lib/core/database/migrations/
# Run migrations through app initialization
```

### Sample Database Schema Commands

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Members table
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  spiritual_status TEXT,
  physical_status TEXT,
  moral_status TEXT,
  organization_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at INTEGER,
  delivered_at INTEGER,
  read_at INTEGER,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

## 🧪 Testing Commands

### Unit Tests

```bash
# Run unit tests
flutter test test/unit/

# Run with coverage
flutter test --coverage test/unit/
```

### Widget Tests

```bash
# Run widget tests
flutter test test/widget/
```

### Integration Tests

```bash
# Run integration tests
flutter test integration_test/
```

## 📦 Package Management

### Add New Dependencies

```bash
# Add regular dependency
flutter pub add package_name

# Add dev dependency
flutter pub add --dev package_name

# Add dependency with specific version
flutter pub add package_name:^1.0.0
```

### Update Dependencies

```bash
# Update all dependencies
flutter pub upgrade

# Update specific package
flutter pub upgrade package_name

# Check outdated packages
flutter pub outdated
```

## 🚀 Deployment

### Play Store (Android)

```bash
# Build release bundle
flutter build appbundle --release

# Upload to Play Console
# File location: build/app/outputs/bundle/release/app-release.aab
```

### App Store (iOS)

```bash
# Build for iOS release
flutter build ios --release

# Archive in Xcode and upload to App Store Connect
```

### Web Deployment

```bash
# Build for web
flutter build web --release

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy to GitHub Pages, Netlify, or Vercel
```

## 🔧 Development Tools

### VS Code Extensions

- Flutter
- Dart
- Flutter Widget Snippets
- Flutter Tree
- Bracket Pair Colorizer

### Useful VS Code Settings

```json
{
  "dart.flutterSdkPath": "/path/to/flutter",
  "dart.lineLength": 80,
  "editor.rulers": [80],
  "dart.previewFlutterUiGuides": true,
  "dart.previewFlutterUiGuidesCustomTracking": true
}
```

## 📝 Git Commands for Version Control

### Initial Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial Flutter project setup with modular architecture"

# Add remote origin
git remote add origin https://github.com/username/church-connect.git

# Push to remote
git push -u origin main
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/authentication

# Add changes
git add .

# Commit changes
git commit -m "Add authentication feature"

# Push feature branch
git push origin feature/authentication

# Merge to main
git checkout main
git merge feature/authentication
```

## 🐛 Troubleshooting Commands

### Common Issues

```bash
# Clean project
flutter clean

# Remove pub cache
flutter pub cache clean

# Repair cache
flutter pub cache repair

# Reset Flutter
flutter doctor
flutter clean
flutter pub get

# Fix Android licenses
flutter doctor --android-licenses

# Rebuild generated files
flutter packages pub run build_runner clean
flutter packages pub run build_runner build
```

### Performance Analysis

```bash
# Analyze performance
flutter analyze

# Check app size
flutter build apk --analyze-size
flutter build ios --analyze-size
```

## 📚 Additional Resources

### Documentation

- [Flutter Documentation](https://docs.flutter.dev/)
- [Dart Documentation](https://dart.dev/guides)
- [Riverpod Documentation](https://riverpod.dev/)
- [GoRouter Documentation](https://pub.dev/packages/go_router)

### Code Quality

```bash
# Format code
dart format .

# Analyze code
flutter analyze

# Fix analysis issues
dart fix --apply
```

---

## 📋 Complete Setup Checklist

- [ ] Flutter SDK installed and configured
- [ ] Project dependencies added to pubspec.yaml
- [ ] Modular directory structure created
- [ ] Firebase project configured
- [ ] Database schema designed
- [ ] Authentication setup
- [ ] State management with Riverpod
- [ ] Navigation with GoRouter
- [ ] UI components library
- [ ] Testing framework setup
- [ ] CI/CD pipeline (optional)
- [ ] Deployment configuration

This setup guide provides a comprehensive reference for building the ChurchConnect app and can be reused for similar Flutter projects with modular architecture.
