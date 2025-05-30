import 'package:json_annotation/json_annotation.dart';

part 'organization_model.g.dart';

/// Enum for organization types
enum OrganizationType {
  @JsonValue('church')
  church,
  @JsonValue('ministry')
  ministry,
  @JsonValue('nonprofit')
  nonprofit,
  @JsonValue('community_group')
  communityGroup,
  @JsonValue('other')
  other,
}

/// Enum for organization status
enum OrganizationStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('suspended')
  suspended,
  @JsonValue('trial')
  trial,
}

/// Model representing organization settings
@JsonSerializable()
class OrganizationSettings {
  final bool allowMemberSelfRegistration;
  final bool requireApprovalForNewMembers;
  final bool enableAutomatedMessages;
  final bool enableAnalytics;
  final bool enableTemplateSharing;
  final int maxMembersAllowed;
  final int maxTemplatesAllowed;
  final int maxMonthlyMessages;
  final String defaultTimeZone;
  final String defaultLanguage;
  final Map<String, bool> featureFlags;

  const OrganizationSettings({
    this.allowMemberSelfRegistration = false,
    this.requireApprovalForNewMembers = true,
    this.enableAutomatedMessages = true,
    this.enableAnalytics = true,
    this.enableTemplateSharing = false,
    this.maxMembersAllowed = 1000,
    this.maxTemplatesAllowed = 100,
    this.maxMonthlyMessages = 10000,
    this.defaultTimeZone = 'UTC',
    this.defaultLanguage = 'en',
    this.featureFlags = const {},
  });

  factory OrganizationSettings.fromJson(Map<String, dynamic> json) =>
      _$OrganizationSettingsFromJson(json);

  Map<String, dynamic> toJson() => _$OrganizationSettingsToJson(this);
}

/// Model representing organization contact information
@JsonSerializable()
class OrganizationContact {
  final String? phone;
  final String? email;
  final String? website;
  final String? address;
  final String? city;
  final String? state;
  final String? country;
  final String? postalCode;
  final double? latitude;
  final double? longitude;

  const OrganizationContact({
    this.phone,
    this.email,
    this.website,
    this.address,
    this.city,
    this.state,
    this.country,
    this.postalCode,
    this.latitude,
    this.longitude,
  });

  factory OrganizationContact.fromJson(Map<String, dynamic> json) =>
      _$OrganizationContactFromJson(json);

  Map<String, dynamic> toJson() => _$OrganizationContactToJson(this);
}

/// Model representing organization statistics
@JsonSerializable()
class OrganizationStats {
  final int totalMembers;
  final int activeMembers;
  final int totalMessages;
  final int monthlyMessages;
  final int totalTemplates;
  final int activeTemplates;
  final double averageDeliveryRate;
  final double averageReadRate;
  final DateTime lastUpdated;

  const OrganizationStats({
    this.totalMembers = 0,
    this.activeMembers = 0,
    this.totalMessages = 0,
    this.monthlyMessages = 0,
    this.totalTemplates = 0,
    this.activeTemplates = 0,
    this.averageDeliveryRate = 0.0,
    this.averageReadRate = 0.0,
    required this.lastUpdated,
  });

  factory OrganizationStats.fromJson(Map<String, dynamic> json) =>
      _$OrganizationStatsFromJson(json);

  Map<String, dynamic> toJson() => _$OrganizationStatsToJson(this);
}

/// Model representing an organization in the ChurchConnect system
@JsonSerializable(explicitToJson: true)
class OrganizationModel {
  final String id;
  final String name;
  final String description;
  final OrganizationType type;
  final OrganizationStatus status;

  final String? logoUrl;
  final String? bannerUrl;
  final OrganizationContact contact;
  final OrganizationSettings settings;
  final OrganizationStats stats;

  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  final String? subscriptionPlan;
  final DateTime? subscriptionExpiresAt;
  final bool isPaid;

  final List<String> adminUserIds;
  final List<String> ministryLeaderIds;
  final Map<String, dynamic>? customFields;
  final List<String>? tags;

  const OrganizationModel({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.status,
    required this.contact,
    required this.settings,
    required this.stats,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.logoUrl,
    this.bannerUrl,
    this.subscriptionPlan,
    this.subscriptionExpiresAt,
    this.isPaid = false,
    this.adminUserIds = const [],
    this.ministryLeaderIds = const [],
    this.customFields,
    this.tags,
  });

  /// Factory constructor for creating an OrganizationModel from JSON
  factory OrganizationModel.fromJson(Map<String, dynamic> json) =>
      _$OrganizationModelFromJson(json);

  /// Convert OrganizationModel to JSON
  Map<String, dynamic> toJson() => _$OrganizationModelToJson(this);

  /// Create a copy of the organization with updated fields
  OrganizationModel copyWith({
    String? id,
    String? name,
    String? description,
    OrganizationType? type,
    OrganizationStatus? status,
    String? logoUrl,
    String? bannerUrl,
    OrganizationContact? contact,
    OrganizationSettings? settings,
    OrganizationStats? stats,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? subscriptionPlan,
    DateTime? subscriptionExpiresAt,
    bool? isPaid,
    List<String>? adminUserIds,
    List<String>? ministryLeaderIds,
    Map<String, dynamic>? customFields,
    List<String>? tags,
  }) {
    return OrganizationModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      logoUrl: logoUrl ?? this.logoUrl,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      contact: contact ?? this.contact,
      settings: settings ?? this.settings,
      stats: stats ?? this.stats,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      subscriptionPlan: subscriptionPlan ?? this.subscriptionPlan,
      subscriptionExpiresAt:
          subscriptionExpiresAt ?? this.subscriptionExpiresAt,
      isPaid: isPaid ?? this.isPaid,
      adminUserIds: adminUserIds ?? this.adminUserIds,
      ministryLeaderIds: ministryLeaderIds ?? this.ministryLeaderIds,
      customFields: customFields ?? this.customFields,
      tags: tags ?? this.tags,
    );
  }

  /// Check if organization is active
  bool get isActive => status == OrganizationStatus.active;

  /// Check if organization is on trial
  bool get isTrial => status == OrganizationStatus.trial;

  /// Check if subscription is expired
  bool get isSubscriptionExpired {
    if (subscriptionExpiresAt == null) return false;
    return DateTime.now().isAfter(subscriptionExpiresAt!);
  }

  /// Get days until subscription expires
  int? get daysUntilExpiration {
    if (subscriptionExpiresAt == null) return null;
    final difference = subscriptionExpiresAt!.difference(DateTime.now());
    return difference.inDays;
  }

  /// Check if organization is approaching limits
  bool get isApproachingMemberLimit {
    return stats.totalMembers >= (settings.maxMembersAllowed * 0.9);
  }

  bool get isApproachingTemplateLimit {
    return stats.totalTemplates >= (settings.maxTemplatesAllowed * 0.9);
  }

  bool get isApproachingMessageLimit {
    return stats.monthlyMessages >= (settings.maxMonthlyMessages * 0.9);
  }

  /// Get member utilization percentage
  double get memberUtilization {
    if (settings.maxMembersAllowed == 0) return 0.0;
    return (stats.totalMembers / settings.maxMembersAllowed) * 100;
  }

  /// Get template utilization percentage
  double get templateUtilization {
    if (settings.maxTemplatesAllowed == 0) return 0.0;
    return (stats.totalTemplates / settings.maxTemplatesAllowed) * 100;
  }

  /// Get message utilization percentage
  double get messageUtilization {
    if (settings.maxMonthlyMessages == 0) return 0.0;
    return (stats.monthlyMessages / settings.maxMonthlyMessages) * 100;
  }

  /// Check if user is admin
  bool isUserAdmin(String userId) {
    return adminUserIds.contains(userId);
  }

  /// Check if user is ministry leader
  bool isUserMinistryLeader(String userId) {
    return ministryLeaderIds.contains(userId);
  }

  /// Check if user has leadership role
  bool isUserLeader(String userId) {
    return isUserAdmin(userId) || isUserMinistryLeader(userId);
  }

  /// Get organization age in days
  int get ageInDays {
    return DateTime.now().difference(createdAt).inDays;
  }

  /// Get member engagement rate
  double get memberEngagementRate {
    if (stats.totalMembers == 0) return 0.0;
    return (stats.activeMembers / stats.totalMembers) * 100;
  }

  /// Check if feature is enabled
  bool isFeatureEnabled(String featureName) {
    return settings.featureFlags[featureName] ?? false;
  }

  /// Get complete address string
  String get fullAddress {
    final parts = <String>[];
    if (contact.address?.isNotEmpty == true) parts.add(contact.address!);
    if (contact.city?.isNotEmpty == true) parts.add(contact.city!);
    if (contact.state?.isNotEmpty == true) parts.add(contact.state!);
    if (contact.postalCode?.isNotEmpty == true) parts.add(contact.postalCode!);
    if (contact.country?.isNotEmpty == true) parts.add(contact.country!);
    return parts.join(', ');
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OrganizationModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'OrganizationModel{id: $id, name: $name, type: $type, status: $status, memberCount: ${stats.totalMembers}}';
  }
}
