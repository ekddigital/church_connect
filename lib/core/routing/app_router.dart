import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Import authentication screens
import '../../features/authentication/screens/login_screen.dart';
import '../../features/authentication/screens/signup_screen.dart';
import '../../features/authentication/providers/auth_provider.dart';

// Import dashboard screen
import '../../features/dashboard/screens/dashboard_screen.dart';

// Import other screens (to be created)
// import '../features/member_care/screens/member_dashboard_screen.dart';
// import '../features/messaging/screens/messaging_dashboard_screen.dart';
// import '../features/analytics/screens/analytics_dashboard_screen.dart';
// import '../features/templates/screens/template_manager_screen.dart';
// import '../features/automation/screens/automation_screen.dart';
// import '../features/organization/screens/organization_settings_screen.dart';

/// App Routes Configuration
class AppRoutes {
  // Authentication Routes
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';

  // Main Dashboard Routes
  static const String home = '/';
  static const String dashboard = '/dashboard';

  // Member Care Routes
  static const String memberDashboard = '/members';
  static const String memberProfile = '/members/:id';
  static const String addMember = '/members/add';
  static const String memberCare = '/member-care';
  static const String prayerRequests = '/prayer-requests';

  // Messaging Routes
  static const String messaging = '/messaging';
  static const String sendMessage = '/messaging/send';
  static const String messageHistory = '/messaging/history';
  static const String templates = '/templates';
  static const String createTemplate = '/templates/create';

  // Analytics Routes
  static const String analytics = '/analytics';
  static const String reports = '/reports';
  static const String engagement = '/engagement';

  // Automation Routes
  static const String automation = '/automation';
  static const String workflows = '/workflows';
  static const String createWorkflow = '/automation/create';

  // Organization Routes
  static const String organization = '/organization';
  static const String settings = '/settings';
  static const String profile = '/profile';

  // Import/Export Routes
  static const String import = '/import';
  static const String export = '/export';
}

/// GoRouter Configuration
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  final isAuthenticated = authState.user != null;

  return GoRouter(
    debugLogDiagnostics: true,
    initialLocation: isAuthenticated ? AppRoutes.dashboard : AppRoutes.login,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isAuthenticated = authState.user != null;
      final isAuthRoute = [
        AppRoutes.login,
        AppRoutes.register,
        AppRoutes.forgotPassword,
      ].contains(state.matchedLocation);

      // Redirect to login if not authenticated and not on auth route
      if (!isAuthenticated && !isAuthRoute) {
        return AppRoutes.login;
      }

      // Redirect to dashboard if authenticated and on auth route
      if (isAuthenticated && isAuthRoute) {
        return AppRoutes.dashboard;
      }

      return null;
    },
    routes: [
      // Authentication Routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgot-password',
        builder: (context, state) =>
            const PlaceholderScreen(title: 'Forgot Password'),
      ),

      // Main App Routes with Shell for Navigation
      ShellRoute(
        builder: (context, state, child) {
          return MainAppShell(child: child);
        },
        routes: [
          GoRoute(
            path: AppRoutes.dashboard,
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),

          // Member Care Routes
          GoRoute(
            path: AppRoutes.memberDashboard,
            name: 'member-dashboard',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Members'),
            routes: [
              GoRoute(
                path: 'add',
                name: 'add-member',
                builder: (context, state) =>
                    const PlaceholderScreen(title: 'Add Member'),
              ),
              GoRoute(
                path: ':id',
                name: 'member-profile',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return PlaceholderScreen(title: 'Member Profile: $id');
                },
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.memberCare,
            name: 'member-care',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Member Care'),
          ),
          GoRoute(
            path: AppRoutes.prayerRequests,
            name: 'prayer-requests',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Prayer Requests'),
          ),

          // Messaging Routes
          GoRoute(
            path: AppRoutes.messaging,
            name: 'messaging',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Messaging'),
            routes: [
              GoRoute(
                path: 'send',
                name: 'send-message',
                builder: (context, state) =>
                    const PlaceholderScreen(title: 'Send Message'),
              ),
              GoRoute(
                path: 'history',
                name: 'message-history',
                builder: (context, state) =>
                    const PlaceholderScreen(title: 'Message History'),
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.templates,
            name: 'templates',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Templates'),
            routes: [
              GoRoute(
                path: 'create',
                name: 'create-template',
                builder: (context, state) =>
                    const PlaceholderScreen(title: 'Create Template'),
              ),
            ],
          ),

          // Analytics Routes
          GoRoute(
            path: AppRoutes.analytics,
            name: 'analytics',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Analytics'),
          ),
          GoRoute(
            path: AppRoutes.reports,
            name: 'reports',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Reports'),
          ),

          // Automation Routes
          GoRoute(
            path: AppRoutes.automation,
            name: 'automation',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Automation'),
            routes: [
              GoRoute(
                path: 'create',
                name: 'create-workflow',
                builder: (context, state) =>
                    const PlaceholderScreen(title: 'Create Workflow'),
              ),
            ],
          ),

          // Organization Routes
          GoRoute(
            path: AppRoutes.organization,
            name: 'organization',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Organization'),
          ),
          GoRoute(
            path: AppRoutes.settings,
            name: 'settings',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Settings'),
          ),

          // Import/Export Routes
          GoRoute(
            path: AppRoutes.import,
            name: 'import',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Import Data'),
          ),
          GoRoute(
            path: AppRoutes.export,
            name: 'export',
            builder: (context, state) =>
                const PlaceholderScreen(title: 'Export Data'),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) =>
        ErrorScreen(error: state.error.toString()),
  );
});

/// Main App Shell with Bottom Navigation
class MainAppShell extends StatelessWidget {
  final Widget child;

  const MainAppShell({
    super.key,
    required this.child,
  });

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/members')) return 1;
    if (location.startsWith('/messaging')) return 2;
    if (location.startsWith('/analytics') || location.startsWith('/reports')) {
      return 3;
    }
    if (location.startsWith('/settings') ||
        location.startsWith('/organization')) {
      return 4;
    }
    return 0; // Dashboard
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        currentIndex: _getCurrentIndex(context),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Members',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.message),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: 'Analytics',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
        onTap: (index) {
          switch (index) {
            case 0:
              context.go(AppRoutes.dashboard);
              break;
            case 1:
              context.go(AppRoutes.memberDashboard);
              break;
            case 2:
              context.go(AppRoutes.messaging);
              break;
            case 3:
              context.go(AppRoutes.analytics);
              break;
            case 4:
              context.go(AppRoutes.settings);
              break;
          }
        },
      ),
    );
  }
}

/// Placeholder Screen for Development
class PlaceholderScreen extends StatelessWidget {
  final String title;

  const PlaceholderScreen({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.construction,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Under Development',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Error Screen
class ErrorScreen extends StatelessWidget {
  final String error;

  const ErrorScreen({
    super.key,
    required this.error,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Error'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.dashboard),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    );
  }
}
