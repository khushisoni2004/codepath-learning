import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../data/auth_repository.dart';
import '../domain/user.dart';

final tokenStorageProvider = Provider<TokenStorage>((_) => SecureTokenStorage());
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(ref.read(tokenStorageProvider)));
final authRepositoryProvider = Provider<AuthRepository>((ref) =>
    AuthRepository(ref.read(apiClientProvider), ref.read(tokenStorageProvider)));

class AuthState {
  const AuthState({this.user, this.loading = false, this.initialized = false, this.error});
  final AppUser? user;
  final bool loading;
  final bool initialized;
  final String? error;
  bool get signedIn => user != null;
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this.repository) : super(const AuthState());
  final AuthRepository repository;
  Future<void> restore() async {
    state = const AuthState(loading: true);
    try { state = AuthState(user: await repository.restore(), initialized: true); }
    catch (e) { state = AuthState(initialized: true, error: e.toString()); }
  }
  Future<bool> login(String email, String password) => _run(() => repository.login(email, password));
  Future<bool> register(String name, String email, String phone, String password) =>
      _run(() => repository.register(name, email, phone, password));
  Future<bool> _run(Future<AppUser> Function() action) async {
    state = AuthState(user: state.user, loading: true, initialized: true);
    try { state = AuthState(user: await action(), initialized: true); return true; }
    catch (e) { state = AuthState(loading: false, initialized: true, error: e.toString()); return false; }
  }
  Future<void> logout() async { await repository.logout(); state = const AuthState(initialized: true); }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) =>
    AuthController(ref.read(authRepositoryProvider)));

