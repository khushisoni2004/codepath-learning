import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../errors/app_exception.dart';
import '../storage/token_storage.dart';

class ApiClient {
  ApiClient(this.storage, {Dio? dio})
      : dio = dio ?? Dio(BaseOptions(baseUrl: ApiConfig.baseUrl,
          connectTimeout: ApiConfig.connectTimeout,
          receiveTimeout: ApiConfig.receiveTimeout,
          headers: const {'Accept': 'application/json'})) {
    this.dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final token = await storage.read();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }));
  }
  final Dio dio;
  final TokenStorage storage;

  Future<Map<String, dynamic>> get(String path) async => _request(() => dio.get(path));
  Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body]) async =>
      _request(() => dio.post(path, data: body));

  Future<Map<String, dynamic>> _request(Future<Response<dynamic>> Function() call) async {
    try {
      final response = await call();
      if (response.data is! Map) throw const AppException('The server returned an invalid response.');
      return Map<String, dynamic>.from(response.data as Map);
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      final data = error.response?.data;
      final serverMessage = data is Map ? data['message']?.toString() : null;
      if (status == 401) await storage.clear();
      throw AppException(serverMessage ?? _fallback(error.type, status), statusCode: status);
    }
  }

  String _fallback(DioExceptionType type, int? status) {
    if (type == DioExceptionType.connectionTimeout || type == DioExceptionType.receiveTimeout) {
      return 'The request timed out. Please try again.';
    }
    if (type == DioExceptionType.connectionError) return 'You appear to be offline.';
    if (status == 403) return 'You do not have access to this resource.';
    if (status == 404) return 'The requested information was not found.';
    return 'CodePath Learning is unavailable right now. Please try again.';
  }
}
