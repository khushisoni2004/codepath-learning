import '../../../core/api/api_client.dart';

class StudentRepository {
  const StudentRepository(this.api);
  final ApiClient api;
  Future<List<Map<String, dynamic>>> achievements() async =>
      ((await api.get('/achievements'))['achievements'] as List? ?? const []).whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e)).toList();
  Future<Map<String, dynamic>?> verifyCertificate(String id) async {
    final data = await api.get('/certificates/verify/${Uri.encodeComponent(id.trim().toUpperCase())}');
    return data['valid'] == true && data['certificate'] is Map ? Map<String, dynamic>.from(data['certificate'] as Map) : null;
  }
  Future<Map<String, dynamic>?> mentorshipStatus() async {
    final data = await api.get('/mentorship/status');
    return data['booking'] is Map ? Map<String, dynamic>.from(data['booking'] as Map) : null;
  }
  Future<void> bookMentorship(Map<String, dynamic> body) async { await api.post('/mentorship/bookings', body); }
  Future<Map<String, dynamic>?> feedback() async { final data = await api.get('/feedback/me'); return data['feedback'] is Map ? Map<String, dynamic>.from(data['feedback'] as Map) : null; }
  Future<void> saveFeedback(Map<String, dynamic> body) async { await api.post('/feedback', body); }
}
