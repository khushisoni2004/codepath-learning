class Registration {
  const Registration({required this.id, required this.course, required this.status});
  final String id;
  final String course;
  final String status;
  factory Registration.fromJson(Map<String, dynamic> json) => Registration(
        id: (json['registrationId'] ?? '').toString(),
        course: (json['course'] ?? '').toString(),
        status: (json['enrollmentStatus'] ?? 'Registered').toString(),
      );
}

class AppUser {
  const AppUser({required this.id, required this.name, required this.email,
    required this.phone, required this.registrations});
  final String id;
  final String name;
  final String email;
  final String phone;
  final List<Registration> registrations;
  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: (json['id'] ?? '').toString(),
        name: (json['name'] ?? json['studentName'] ?? '').toString(),
        email: (json['email'] ?? '').toString(),
        phone: (json['phone'] ?? json['mobile'] ?? '').toString(),
        registrations: (json['registrations'] as List? ?? const [])
            .whereType<Map>().map((e) => Registration.fromJson(Map<String, dynamic>.from(e))).toList(),
      );
}

