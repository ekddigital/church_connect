import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/models/organization_model.dart';
import '../../../shared/services/auth_api_service.dart';

/// Authentication state
class AuthState {
  final UserModel? user;
  final OrganizationModel? organization;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  const AuthState({
    this.user,
    this.organization,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserModel? user,
    OrganizationModel? organization,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      organization: organization ?? this.organization,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

/// Authentication provider
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthApiService _authApiService;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  AuthNotifier(this._authApiService) : super(const AuthState());

  /// Initialize authentication state from stored credentials
  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');

      if (token != null) {
        _authApiService.setAuthToken(token);
        final user = await _authApiService.getUserProfile();

        state = state.copyWith(
          user: user,
          isAuthenticated: true,
        );
      }
    } catch (e) {
      // Token expired or invalid, clear stored credentials
      await _clearStoredAuth();
    }
  }

  /// Clear stored authentication data
  Future<void> _clearStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    _authApiService.clearAuthToken();
  }

  /// Sign in with email and password
  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final authResponse = await _authApiService.login(
        email: email,
        password: password,
      );

      if (authResponse.success && authResponse.token != null) {
        // Store authentication token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', authResponse.token!);
        if (authResponse.refreshToken != null) {
          await prefs.setString('refresh_token', authResponse.refreshToken!);
        }

        // Set token in API service
        _authApiService.setAuthToken(authResponse.token!);

        state = state.copyWith(
          user: authResponse.user,
          organization: authResponse.organization,
          isLoading: false,
          isAuthenticated: true,
        );
      } else {
        throw Exception(authResponse.message ?? 'Login failed');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Sign up with email and password
  Future<void> signUp({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String organizationName,
    required String organizationType,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final authResponse = await _authApiService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        organizationName: organizationName,
        organizationType: organizationType,
      );

      if (authResponse.success && authResponse.token != null) {
        // Store authentication token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', authResponse.token!);
        if (authResponse.refreshToken != null) {
          await prefs.setString('refresh_token', authResponse.refreshToken!);
        }

        // Set token in API service
        _authApiService.setAuthToken(authResponse.token!);

        state = state.copyWith(
          user: authResponse.user,
          organization: authResponse.organization,
          isLoading: false,
          isAuthenticated: true,
        );
      } else {
        throw Exception(authResponse.message ?? 'Registration failed');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Sign in with Google
  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        // User cancelled the sign-in
        state = state.copyWith(isLoading: false);
        return;
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      if (googleAuth.accessToken == null || googleAuth.idToken == null) {
        throw Exception('Failed to get Google authentication tokens');
      }

      final authResponse = await _authApiService.loginWithGoogle(
        idToken: googleAuth.idToken!,
        accessToken: googleAuth.accessToken!,
      );

      if (authResponse.success && authResponse.token != null) {
        // Store authentication token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', authResponse.token!);
        if (authResponse.refreshToken != null) {
          await prefs.setString('refresh_token', authResponse.refreshToken!);
        }

        // Set token in API service
        _authApiService.setAuthToken(authResponse.token!);

        state = state.copyWith(
          user: authResponse.user,
          organization: authResponse.organization,
          isLoading: false,
          isAuthenticated: true,
        );
      } else {
        throw Exception(authResponse.message ?? 'Google sign-in failed');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);

    try {
      await _authApiService.logout();
      await _clearStoredAuth();

      // Sign out from Google as well
      await _googleSignIn.signOut();

      state = const AuthState();
    } catch (e) {
      // Even if logout fails on server, clear local state
      await _clearStoredAuth();
      await _googleSignIn.signOut();
      state = const AuthState();
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _authApiService.resetPassword(email);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Update user profile
  Future<void> updateProfile(Map<String, dynamic> updates) async {
    if (state.user == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final updatedUser = await _authApiService.updateProfile(updates);

      state = state.copyWith(
        user: updatedUser,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Refresh authentication token
  Future<void> refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refresh_token');

      if (refreshToken != null) {
        final authResponse = await _authApiService.refreshToken(refreshToken);

        if (authResponse.success && authResponse.token != null) {
          await prefs.setString('auth_token', authResponse.token!);
          if (authResponse.refreshToken != null) {
            await prefs.setString('refresh_token', authResponse.refreshToken!);
          }

          _authApiService.setAuthToken(authResponse.token!);

          if (authResponse.user != null) {
            state = state.copyWith(
              user: authResponse.user,
              organization: authResponse.organization,
            );
          }
        }
      }
    } catch (e) {
      // Refresh failed, user needs to log in again
      await _clearStoredAuth();
      state = const AuthState();
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Check if user has permission
  bool hasPermission(String permission) {
    return state.user?.role.hasPermission(permission) ?? false;
  }

  /// Check if user can manage members
  bool get canManageMembers => hasPermission('manage_members');

  /// Check if user can send messages
  bool get canSendMessages => hasPermission('send_messages');

  /// Check if user can view analytics
  bool get canViewAnalytics => hasPermission('view_analytics');

  /// Check if user can manage templates
  bool get canManageTemplates => hasPermission('manage_templates');

  /// Check if user can manage automation
  bool get canManageAutomation => hasPermission('manage_automation');

  /// Check if user can manage organization
  bool get canManageOrganization => hasPermission('manage_organization');
}

/// Auth provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authApiService = ref.watch(authApiServiceProvider);
  return AuthNotifier(authApiService);
});

/// Current user provider
final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

/// Current organization provider
final currentOrganizationProvider = Provider<OrganizationModel?>((ref) {
  return ref.watch(authProvider).organization;
});

/// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
