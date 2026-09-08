import 'package:flutter_test/flutter_test.dart';
import 'package:codepath_learning/core/storage/token_storage.dart';

void main() {
  test('memory token lifecycle mirrors secure storage contract', () async {
    final storage = MemoryTokenStorage();
    expect(await storage.read(), isNull);
    await storage.write('jwt');
    expect(await storage.read(), 'jwt');
    await storage.clear();
    expect(await storage.read(), isNull);
  });
}

