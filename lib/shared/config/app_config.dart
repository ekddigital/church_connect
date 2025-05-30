/// Application Configuration
/// Contains environment-specific settings and API endpoints
class AppConfig {
  static const String appName = 'ChurchConnect';
  static const String appVersion = '1.0.0';

  // Environment settings
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  // API Configuration
  static const String baseApiUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  // Database Configuration (for future MySQL integration)
  static const String databaseUrl = String.fromEnvironment(
    'DATABASE_URL',
    defaultValue: '',
  );

  // Firebase Configuration (optional - for push notifications)
  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: '',
  );

  // OAuth/Authentication secrets (if using external auth)
  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
    defaultValue: '',
  );

  // Encryption keys (for local data encryption)
  static const String encryptionKey = String.fromEnvironment(
    'ENCRYPTION_KEY',
    defaultValue: 'default-dev-key-change-in-production',
  );

  // Feature flags
  static const bool enableFirebaseAuth = bool.fromEnvironment(
    'ENABLE_FIREBASE_AUTH',
    defaultValue: false,
  );

  static const bool enablePushNotifications = bool.fromEnvironment(
    'ENABLE_PUSH_NOTIFICATIONS',
    defaultValue: false,
  );

  // Development settings
  static bool get isProduction => environment == 'production';
  static bool get isDevelopment => environment == 'development';
  static bool get enableLogging => isDevelopment;

  // API timeouts
  static const int apiTimeoutSeconds = 30;
  static const int connectionTimeoutSeconds = 10;
}
