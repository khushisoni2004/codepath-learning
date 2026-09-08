import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final localeProvider = StateNotifierProvider<LocaleController, Locale>((_) => LocaleController());
class LocaleController extends StateNotifier<Locale> {
  LocaleController() : super(const Locale('en')) { _restore(); }
  Future<void> _restore() async { final code = (await SharedPreferences.getInstance()).getString('language'); if (code != null) state = Locale(code); }
  Future<void> set(Locale locale) async { state = locale; (await SharedPreferences.getInstance()).setString('language', locale.languageCode); }
}

extension L10n on BuildContext {
  bool get hindi => Localizations.localeOf(this).languageCode == 'hi';
  String tr(String en, String hi) => hindi ? hi : en;
}

