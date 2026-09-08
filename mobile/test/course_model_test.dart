import 'package:flutter_test/flutter_test.dart';
import 'package:codepath_learning/features/courses/domain/course.dart';

void main() {
  test('catalog slugs are unique and lessons are real', () {
    expect(courses.map((e) => e.slug).toSet().length, courses.length);
    expect(courses.every((e) => e.lessons.isNotEmpty), isTrue);
    expect(courses.firstWhere((e) => e.slug == 'python').title, 'Python Programming');
  });
}

