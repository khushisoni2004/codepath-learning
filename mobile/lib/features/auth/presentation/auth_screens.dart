import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/localization.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget { const LoginScreen({super.key}); @override ConsumerState<LoginScreen> createState() => _LoginState(); }
class _LoginState extends ConsumerState<LoginScreen> {
  final email = TextEditingController(); final password = TextEditingController(); bool hidden = true;
  @override void dispose() { email.dispose(); password.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) { final state = ref.watch(authControllerProvider); return _AuthShell(title: context.tr('Welcome back', 'वापसी पर स्वागत है'), subtitle: context.tr('Continue your learning journey.', 'अपनी सीखने की यात्रा जारी रखें।'), child: Column(children: [
    TextField(controller: email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], decoration: InputDecoration(labelText: context.tr('Email', 'ईमेल'), prefixIcon: const Icon(Icons.email_outlined))), const SizedBox(height: 14),
    TextField(controller: password, obscureText: hidden, autofillHints: const [AutofillHints.password], decoration: InputDecoration(labelText: context.tr('Password', 'पासवर्ड'), prefixIcon: const Icon(Icons.lock_outline), suffixIcon: IconButton(onPressed: () => setState(() => hidden = !hidden), icon: Icon(hidden ? Icons.visibility : Icons.visibility_off)))),
    Align(alignment: Alignment.centerRight, child: TextButton(onPressed: () => context.push('/forgot-password'), child: Text(context.tr('Forgot password?', 'पासवर्ड भूल गए?')))),
    if (state.error != null) _ErrorText(state.error!),
    ElevatedButton(onPressed: state.loading ? null : () async { if (await ref.read(authControllerProvider.notifier).login(email.text, password.text) && mounted) context.go('/home'); }, child: state.loading ? const SizedBox.square(dimension: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text(context.tr('Login', 'लॉग इन'))),
    TextButton(onPressed: () => context.go('/register'), child: Text(context.tr('Create an account', 'खाता बनाएँ'))),
  ])); }
}

class RegisterScreen extends ConsumerStatefulWidget { const RegisterScreen({super.key}); @override ConsumerState<RegisterScreen> createState() => _RegisterState(); }
class _RegisterState extends ConsumerState<RegisterScreen> {
  final name = TextEditingController(), email = TextEditingController(), phone = TextEditingController(), password = TextEditingController();
  @override void dispose() { name.dispose(); email.dispose(); phone.dispose(); password.dispose(); super.dispose(); }
  @override Widget build(BuildContext context) { final state = ref.watch(authControllerProvider); return _AuthShell(title: context.tr('Create your account', 'अपना खाता बनाएँ'), subtitle: context.tr('Start learning with CodePath.', 'CodePath के साथ सीखना शुरू करें।'), child: Column(children: [
    _field(name, context.tr('Full name', 'पूरा नाम'), Icons.person_outline), const SizedBox(height: 12), _field(email, context.tr('Email', 'ईमेल'), Icons.email_outlined, keyboard: TextInputType.emailAddress), const SizedBox(height: 12), _field(phone, context.tr('Mobile number', 'मोबाइल नंबर'), Icons.phone_outlined, keyboard: TextInputType.phone), const SizedBox(height: 12), TextField(controller: password, obscureText: true, decoration: InputDecoration(labelText: context.tr('Password (8+ characters)', 'पासवर्ड (8+ अक्षर)'), prefixIcon: const Icon(Icons.lock_outline))), const SizedBox(height: 16),
    if (state.error != null) _ErrorText(state.error!), ElevatedButton(onPressed: state.loading ? null : () async { if (await ref.read(authControllerProvider.notifier).register(name.text, email.text, phone.text, password.text) && mounted) context.go('/home'); }, child: Text(context.tr('Register', 'रजिस्टर करें'))),
    TextButton(onPressed: () => context.go('/login'), child: Text(context.tr('Already have an account?', 'पहले से खाता है?'))),
  ])); }
  Widget _field(TextEditingController c, String label, IconData icon, {TextInputType? keyboard}) => TextField(controller: c, keyboardType: keyboard, decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)));
}

class ForgotPasswordScreen extends ConsumerStatefulWidget { const ForgotPasswordScreen({super.key}); @override ConsumerState<ForgotPasswordScreen> createState() => _ForgotState(); }
class _ForgotState extends ConsumerState<ForgotPasswordScreen> { final email = TextEditingController(); String? message; bool busy = false;
  @override Widget build(BuildContext context) => _AuthShell(title: context.tr('Reset password', 'पासवर्ड रीसेट करें'), subtitle: context.tr('We will email the secure website reset link.', 'हम सुरक्षित वेबसाइट रीसेट लिंक ईमेल करेंगे।'), child: Column(children: [TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(labelText: context.tr('Email', 'ईमेल'))), const SizedBox(height: 16), if (message != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(message!)), ElevatedButton(onPressed: busy ? null : () async { setState(() => busy = true); try { message = await ref.read(authRepositoryProvider).forgotPassword(email.text); } catch (e) { message = e.toString(); } if (mounted) setState(() => busy = false); }, child: Text(context.tr('Send reset link', 'रीसेट लिंक भेजें')))])); }

class _AuthShell extends StatelessWidget { const _AuthShell({required this.title, required this.subtitle, required this.child}); final String title, subtitle; final Widget child;
  @override Widget build(BuildContext context) => Scaffold(body: SafeArea(child: Center(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 440), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [Image.asset('assets/images/codepath-learning-logo.png', height: 76, errorBuilder: (_, __, ___) => const Icon(Icons.school_rounded, size: 68)), const SizedBox(height: 24), Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(height: 8), Text(subtitle, style: Theme.of(context).textTheme.bodyLarge), const SizedBox(height: 28), child])))))); }
class _ErrorText extends StatelessWidget { const _ErrorText(this.text); final String text; @override Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(text, style: TextStyle(color: Theme.of(context).colorScheme.error), textAlign: TextAlign.center)); }

