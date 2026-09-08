import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../auth/presentation/auth_controller.dart';

class SplashScreen extends ConsumerStatefulWidget { const SplashScreen({super.key}); @override ConsumerState<SplashScreen> createState() => _SplashState(); }
class _SplashState extends ConsumerState<SplashScreen> {
  @override void initState() { super.initState(); Future.microtask(_start); }
  Future<void> _start() async { await ref.read(authControllerProvider.notifier).restore(); final first = (await SharedPreferences.getInstance()).getBool('onboarding_complete') != true; if (!mounted) return; if (first) context.go('/onboarding'); else context.go(ref.read(authControllerProvider).signedIn ? '/home' : '/login'); }
  @override Widget build(BuildContext context) => Scaffold(body: Center(child: Semantics(label: 'CodePath Learning', child: Column(mainAxisSize: MainAxisSize.min, children: [Image.asset('assets/images/codepath-learning-logo.png', height: 100, errorBuilder: (_, __, ___) => Icon(Icons.school_rounded, size: 86, color: Theme.of(context).colorScheme.primary)), const SizedBox(height: 20), const Text('CodePath Learning', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900)), const SizedBox(height: 24), const SizedBox.square(dimension: 24, child: CircularProgressIndicator(strokeWidth: 2))]))));
}

