import 'package:flutter_test/flutter_test.dart';
import 'package:codepath_learning/core/api/api_client.dart';
import 'package:codepath_learning/core/storage/token_storage.dart';
import 'package:codepath_learning/features/auth/data/auth_repository.dart';

class FakeApiClient extends ApiClient {
  FakeApiClient(super.storage, this.response);
  Map<String, dynamic> response;
  Map<String, dynamic>? sent;
  @override Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body]) async {
    sent = body;
    return response;
  }
}

void main() {
  test('login sends existing API contract and persists JWT', () async {
    final storage = MemoryTokenStorage();
    final api = FakeApiClient(storage, {'token':'signed.jwt','user':{'id':'u1','name':'Asha','email':'asha@example.com','phone':'9876543210','registrations':[]}});
    final user = await AuthRepository(api, storage).login(' asha@example.com ', 'password');
    expect(api.sent, {'email':'asha@example.com','password':'password'});
    expect(await storage.read(), 'signed.jwt');
    expect(user.name, 'Asha');
  });

  test('malformed authentication response is rejected', () async {
    final storage = MemoryTokenStorage();
    final api = FakeApiClient(storage, {'success':true});
    await expectLater(AuthRepository(api, storage).login('a@b.com', 'password'), throwsFormatException);
    expect(await storage.read(), isNull);
  });
}
