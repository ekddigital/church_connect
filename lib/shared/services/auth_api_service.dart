import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../models/organization_model.dart';
import 'api_service.dart';

/// Authentication API service for handling login, registration, and user management
class AuthApiService {
  final ApiService _apiService;

  AuthApiService(this._apiService);

  /// Login with email and password
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiService.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    return AuthResponse.fromJson(response.data);
  }

  /// Register new user
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String organizationName,
    required String organizationType,
  }) async {
    final response = await _apiService.post('/auth/register', data: {
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'organizationName': organizationName,
      'organizationType': organizationType,
    });

    return AuthResponse.fromJson(response.data);
  }

  /// Refresh authentication token
  Future<AuthResponse> refreshToken(String refreshToken) async {
    final response = await _apiService.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });

    return AuthResponse.fromJson(response.data);
  }

  /// Logout user
  Future<void> logout() async {
    await _apiService.post('/auth/logout');
    _apiService.clearAuthToken();
  }

  /// Get current user profile
  Future<UserModel> getUserProfile() async {
    final response = await _apiService.get('/users/profile');
    return UserModel.fromJson(response.data['user']);
  }

  /// Update user profile
  Future<UserModel> updateProfile(Map<String, dynamic> updates) async {
    final response = await _apiService.put('/users/profile', data: updates);
    return UserModel.fromJson(response.data['user']);
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    await _apiService.post('/auth/reset-password', data: {
      'email': email,
    });
  }

  /// Set authentication token
  void setAuthToken(String token) {
    _apiService.setAuthToken(token);
  }

  /// Clear authentication token
  void clearAuthToken() {
    _apiService.clearAuthToken();
  }
}

/// Authentication response model
class AuthResponse {
  final bool success;
  final String? message;
  final String? token;
  final String? refreshToken;
  final UserModel? user;
  final OrganizationModel? organization;

  AuthResponse({
    required this.success,
    this.message,
    this.token,
    this.refreshToken,
    this.user,
    this.organization,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] ?? false,
      message: json['message'],
      token: json['token'],
      refreshToken: json['refreshToken'],
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
      organization: json['organization'] != null
          ? OrganizationModel.fromJson(json['organization'])
          : null,
    );
  }
}

/// Auth API Service Provider
final authApiServiceProvider = Provider<AuthApiService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthApiService(apiService);
});
