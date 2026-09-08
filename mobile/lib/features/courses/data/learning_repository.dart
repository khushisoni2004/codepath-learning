import '../../../core/api/api_client.dart';

class LearningRepository {
  const LearningRepository(this.api);
  final ApiClient api;
  Future<List<String>> myCourses() async {
    final data = await api.get('/payments/my-courses');
    return (data['paidCourses'] as List? ?? const []).map((e) => e.toString()).toList();
  }
  Future<Uri> resource(String type) async {
    final data = await api.get('/payments/student-resource/$type');
    final value = data['url']?.toString();
    if (value == null || value.isEmpty) throw const FormatException('Resource URL missing.');
    return Uri.parse(value);
  }
}

