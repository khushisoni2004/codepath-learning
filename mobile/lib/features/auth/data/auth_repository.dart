import '../../../core/api/api_client.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/user.dart';

class AuthRepository {
  const AuthRepository(this.api, this.storage);
  final ApiClient api;
  final TokenStorage storage;

  Future<AppUser?> restore() async {
    if (await storage.read() == null) return null;
    try {
      final data = await api.get('/auth/me');
      return AppUser.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    } on AppException catch (error) {
      if (error.statusCode == 401) await storage.clear();
      rethrow;
    }
  }

  Future<AppUser> login(String email, String password) =>
      _authenticate('/auth/login', {'email': email.trim(), 'password': password});

  Future<AppUser> register(String name, String email, String mobile, String password) =>
      _authenticate('/auth/register', {'name': name.trim(), 'email': email.trim(),
        'mobile': mobile.replaceAll(RegExp(r'\D'), ''), 'password': password});

  Future<AppUser> _authenticate(String path, Map<String, dynamic> body) async {
    final data = await api.post(path, body);
    final token = data['token']?.toString();
    if (token == null || token.isEmpty || data['user'] is! Map) {
      throw const FormatException('Invalid authentication response.');
    }
    await storage.write(token);
    return AppUser.fromJson(Map<String, dynamic>.from(data['user'] as Map));
  }

  Future<String> forgotPassword(String email) async =>
      (await api.post('/auth/forgot-password', {'email': email.trim()}))['message'].toString();
  Future<String> resetPassword(String token, String password) async =>
      (await api.post('/auth/reset-password', {'token': token, 'password': password,
        'confirmPassword': password}))['message'].toString();
  Future<void> logout() => storage.clear();
}
