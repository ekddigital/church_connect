import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

/// User Model for Authentication and Profile Management
@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final String? phoneNumber;
  final UserRole role;
  final String organizationId;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? lastLoginAt;
  final Map<String, dynamic>? preferences;

  const UserModel({
    required this.id,
    required this.email,
    this.displayName,
    this.photoUrl,
    this.phoneNumber,
    required this.role,
    required this.organizationId,
    this.isActive = true,
    required this.createdAt,
    this.lastLoginAt,
    this.preferences,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  UserModel copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoUrl,
    String? phoneNumber,
    UserRole? role,
    String? organizationId,
    bool? isActive,
    DateTime? createdAt,
    DateTime? lastLoginAt,
    Map<String, dynamic>? preferences,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      role: role ?? this.role,
      organizationId: organizationId ?? this.organizationId,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      preferences: preferences ?? this.preferences,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'UserModel{id: $id, email: $email, role: $role}';
}

/// User Roles for Role-Based Access Control
enum UserRole {
  @JsonValue('admin')
  admin,

  @JsonValue('ministry_leader')
  ministryLeader,

  @JsonValue('volunteer')
  volunteer,

  @JsonValue('member')
  member;

  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Administrator';
      case UserRole.ministryLeader:
        return 'Ministry Leader';
      case UserRole.volunteer:
        return 'Volunteer';
      case UserRole.member:
        return 'Member';
    }
  }

  List<String> get permissions {
    switch (this) {
      case UserRole.admin:
        return [
          'manage_users',
          'manage_members',
          'send_messages',
          'view_analytics',
          'manage_templates',
          'manage_automation',
          'manage_organization',
          'export_data',
          'import_data',
        ];
      case UserRole.ministryLeader:
        return [
          'manage_members',
          'send_messages',
          'view_analytics',
          'manage_templates',
          'create_automation',
          'export_data',
        ];
      case UserRole.volunteer:
        return [
          'view_members',
          'send_messages',
          'create_templates',
        ];
      case UserRole.member:
        return [
          'view_profile',
          'update_profile',
        ];
    }
  }

  bool hasPermission(String permission) {
    return permissions.contains(permission);
  }
}
