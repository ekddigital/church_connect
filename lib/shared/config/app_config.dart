/// Application configuration constants
class AppConfig {
  // API Configuration
  static const String baseApiUrl = 'https://api.churchconnect.com';

  // Timeout settings (in seconds)
  static const int connectionTimeoutSeconds = 30;
  static const int apiTimeoutSeconds = 60;

  // Debug settings
  static const bool enableLogging = true;

  // App Information
  static const String appName = 'Church Connect';
  static const String appVersion = '1.0.0';

  // Environment settings
  static const bool isProduction = false;
  static const bool isDebug = true;

  // Database settings
  static const String databaseName = 'church_connect.db';
  static const int databaseVersion = 1;

  // Cache settings
  static const int cacheExpirationHours = 24;

  // UI settings
  static const int maxRetryAttempts = 3;
  static const int defaultPageSize = 20;
}
