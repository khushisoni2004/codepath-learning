import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:codepath_learning/features/careers/presentation/careers_screen.dart';

void main() {
  testWidgets('career guide renders and filters', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CareersScreen()));
    expect(find.text('Diploma government careers'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'ISRO');
    await tester.pump();
    expect(find.text('ISRO Technical Assistant'), findsOneWidget);
    expect(find.text('BEL Technical Assistant'), findsNothing);
  });
}
