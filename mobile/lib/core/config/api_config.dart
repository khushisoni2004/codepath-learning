abstract final class ApiConfig {
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://codepath-learning-api.vercel.app/api',
  );
  static const connectTimeout = Duration(seconds: 12);
  static const receiveTimeout = Duration(seconds: 18);
}

