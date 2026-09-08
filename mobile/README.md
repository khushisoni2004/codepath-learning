# CodePath Learning mobile

Production-oriented native Flutter student app for CodePath Learning. All source is contained in `mobile`; the React website and Express backend are unchanged.

## Architecture

Feature-first Flutter with Material 3, Riverpod state, `go_router`, Dio, secure token storage and SharedPreferences for onboarding/language. UI, repositories, API transport, models and storage are separated without duplicating the backend.

## Features

- Splash and server-validated JWT session restore
- Three-page first-run onboarding
- Native login, registration and forgot-password request
- Student dashboard, real paid enrolments and native course/syllabus views
- Backend-authorized classroom and support resources
- Public certificate verification, certificate detail/open/share
- Diploma CS/IT government-career guide with search and details
- Authenticated mentorship, achievements and validated feedback
- Profile, support, policies, language and logout
- English/Hindi UI, persisted locally
- Loading, empty, error and retry states on API-backed views

## Setup on macOS

Install Flutter stable and Android Studio/Xcode, then from this directory run:

```bash
cd /Users/khushisoni/Desktop/codepath-learning/mobile
flutter create --platforms=android,ios --org in.co.codepathlearning --project-name codepath_learning .
flutter pub get
flutter doctor
flutter run
```

`flutter create` completes or refreshes Flutter-owned platform scaffolding; the checked-in `lib`, `assets`, tests and package configuration are the application source. If it asks about existing files, retain this repository's `lib`, `test`, `pubspec.yaml`, `APP_AUDIT.md` and `README.md`.

Production API configuration is centralized in `lib/core/config/api_config.dart` and defaults to:

```text
https://codepath-learning-api.vercel.app/api
```

For a compatible environment:

```bash
flutter run --dart-define=API_BASE_URL=https://your-api.example/api
```

Only HTTPS should be used outside a local development build.

## Validation and builds

```bash
cd /Users/khushisoni/Desktop/codepath-learning/mobile
flutter pub get
dart format --set-exit-if-changed lib test
flutter analyze
flutter test
flutter build apk --debug
```

Release signing and store metadata should be configured through private CI/store settings; do not commit signing keys.

## Authentication and security

The app sends the existing backend JWT as a Bearer token and validates restored sessions with `/auth/me`. Tokens use Keychain/Keystore-backed `flutter_secure_storage`; logout and HTTP 401 clear them. Offline/server errors do not intentionally discard a potentially valid session. No passwords, database credentials, Razorpay secrets, admin keys or sensitive logs are stored.

## Localization

Flutter localization delegates provide platform Material localization for `en` and `hi`. App copy switches through a small context extension and the chosen locale persists in SharedPreferences.

## Payment note and limitations

Digital-content store billing requirements need a product/policy decision before native checkout ships. Course enrolment therefore opens the official website in the external browser; entitlement continues to come only from the server. No WebView is used.

The existing API has no authenticated `my certificates` list, structured progress/assignment API, announcements API or catalog endpoint. Mobile never fabricates these. Certificate verification works, course entitlement works, and protected URLs remain server-authorized. The career catalog is a reviewed native snapshot of the repository's informational guide; official notifications remain authoritative.

