import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'localization.dart';
import 'router.dart';
import 'theme.dart';

class CodePathApp extends ConsumerWidget { const CodePathApp({super.key}); @override Widget build(BuildContext context, WidgetRef ref) => MaterialApp.router(debugShowCheckedModeBanner: false, title: 'CodePath Learning', theme: AppTheme.light, locale: ref.watch(localeProvider), supportedLocales: const [Locale('en'), Locale('hi')], localizationsDelegates: const [GlobalMaterialLocalizations.delegate, GlobalWidgetsLocalizations.delegate, GlobalCupertinoLocalizations.delegate], routerConfig: router); }

