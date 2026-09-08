import 'package:flutter_test/flutter_test.dart';
import 'package:codepath_learning/features/auth/domain/user.dart';

void main() {
  test('parses public user and registrations', () {
    final user = AppUser.fromJson({'id':'1','name':'Asha','email':'a@example.com','mobile':'9876543210','registrations':[{'registrationId':'CPL-1','course':'Python Programming','enrollmentStatus':'Registered'}]});
    expect(user.name, 'Asha');
    expect(user.phone, '9876543210');
    expect(user.registrations.single.id, 'CPL-1');
  });
}

