import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/auth_screens.dart';
import '../features/careers/presentation/careers_screen.dart';
import '../features/common/presentation/student_screens.dart';
import '../features/home/presentation/main_shell.dart';
import '../features/onboarding/presentation/onboarding_screen.dart';
import '../features/splash/presentation/splash_screen.dart';

final router = GoRouter(initialLocation: '/splash', routes: [
  GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
  GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
  GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
  GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
  GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
  ShellRoute(builder: (_, __, child) => MainShell(child: child), routes: [
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/learn', builder: (_, __) => const LearnScreen()),
    GoRoute(path: '/careers', builder: (_, __) => const CareersScreen()),
    GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
  ]),
  GoRoute(path: '/course/:slug', builder: (_, state) => CourseDetailScreen(slug: state.pathParameters['slug']!)),
  GoRoute(path: '/certificates', builder: (_, __) => const CertificatesScreen()),
  GoRoute(path: '/mentorship', builder: (_, __) => const MentorshipScreen()),
  GoRoute(path: '/achievements', builder: (_, __) => const AchievementsScreen()),
  GoRoute(path: '/feedback', builder: (_, __) => const FeedbackScreen()),
], errorBuilder: (_, __) => const Directionality(textDirection: TextDirection.ltr, child: Center(child: Text('Page not found'))));

