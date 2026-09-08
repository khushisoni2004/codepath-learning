import 'package:flutter/material.dart';

abstract final class AppTheme {
  static const primary = Color(0xFF5B4FE9);
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.light,
      surface: const Color(0xFFF8F8FE));
    return ThemeData(useMaterial3: true, colorScheme: scheme, scaffoldBackgroundColor: scheme.surface,
      appBarTheme: const AppBarTheme(centerTitle: false, surfaceTintColor: Colors.transparent),
      cardTheme: CardThemeData(elevation: 0, margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFFE5E7F4)))),
      inputDecorationTheme: InputDecorationTheme(filled: true, fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFDDE1EE)))),
      elevatedButtonTheme: ElevatedButtonThemeData(style: ElevatedButton.styleFrom(minimumSize: const Size(48, 52),
        backgroundColor: primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)))),
    );
  }
}

