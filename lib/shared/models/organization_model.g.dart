// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'organization_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrganizationSettings _$OrganizationSettingsFromJson(
        Map<String, dynamic> json) =>
    OrganizationSettings(
      allowMemberSelfRegistration:
          json['allowMemberSelfRegistration'] as bool? ?? false,
      requireApprovalForNewMembers:
          json['requireApprovalForNewMembers'] as bool? ?? true,
      enableAutomatedMessages: json['enableAutomatedMessages'] as bool? ?? true,
      enableAnalytics: json['enableAnalytics'] as bool? ?? true,
      enableTemplateSharing: json['enableTemplateSharing'] as bool? ?? false,
      maxMembersAllowed: (json['maxMembersAllowed'] as num?)?.toInt() ?? 1000,
      maxTemplatesAllowed:
          (json['maxTemplatesAllowed'] as num?)?.toInt() ?? 100,
      maxMonthlyMessages:
          (json['maxMonthlyMessages'] as num?)?.toInt() ?? 10000,
      defaultTimeZone: json['defaultTimeZone'] as String? ?? 'UTC',
      defaultLanguage: json['defaultLanguage'] as String? ?? 'en',
      featureFlags: (json['featureFlags'] as Map<String, dynamic>?)?.map(
            (k, e) => MapEntry(k, e as bool),
          ) ??
          const {},
    );

Map<String, dynamic> _$OrganizationSettingsToJson(
        OrganizationSettings instance) =>
    <String, dynamic>{
      'allowMemberSelfRegistration': instance.allowMemberSelfRegistration,
      'requireApprovalForNewMembers': instance.requireApprovalForNewMembers,
      'enableAutomatedMessages': instance.enableAutomatedMessages,
      'enableAnalytics': instance.enableAnalytics,
      'enableTemplateSharing': instance.enableTemplateSharing,
      'maxMembersAllowed': instance.maxMembersAllowed,
      'maxTemplatesAllowed': instance.maxTemplatesAllowed,
      'maxMonthlyMessages': instance.maxMonthlyMessages,
      'defaultTimeZone': instance.defaultTimeZone,
      'defaultLanguage': instance.defaultLanguage,
      'featureFlags': instance.featureFlags,
    };

OrganizationContact _$OrganizationContactFromJson(Map<String, dynamic> json) =>
    OrganizationContact(
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      website: json['website'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      country: json['country'] as String?,
      postalCode: json['postalCode'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$OrganizationContactToJson(
        OrganizationContact instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'email': instance.email,
      'website': instance.website,
      'address': instance.address,
      'city': instance.city,
      'state': instance.state,
      'country': instance.country,
      'postalCode': instance.postalCode,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

OrganizationStats _$OrganizationStatsFromJson(Map<String, dynamic> json) =>
    OrganizationStats(
      totalMembers: (json['totalMembers'] as num?)?.toInt() ?? 0,
      activeMembers: (json['activeMembers'] as num?)?.toInt() ?? 0,
      totalMessages: (json['totalMessages'] as num?)?.toInt() ?? 0,
      monthlyMessages: (json['monthlyMessages'] as num?)?.toInt() ?? 0,
      totalTemplates: (json['totalTemplates'] as num?)?.toInt() ?? 0,
      activeTemplates: (json['activeTemplates'] as num?)?.toInt() ?? 0,
      averageDeliveryRate:
          (json['averageDeliveryRate'] as num?)?.toDouble() ?? 0.0,
      averageReadRate: (json['averageReadRate'] as num?)?.toDouble() ?? 0.0,
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );

Map<String, dynamic> _$OrganizationStatsToJson(OrganizationStats instance) =>
    <String, dynamic>{
      'totalMembers': instance.totalMembers,
      'activeMembers': instance.activeMembers,
      'totalMessages': instance.totalMessages,
      'monthlyMessages': instance.monthlyMessages,
      'totalTemplates': instance.totalTemplates,
      'activeTemplates': instance.activeTemplates,
      'averageDeliveryRate': instance.averageDeliveryRate,
      'averageReadRate': instance.averageReadRate,
      'lastUpdated': instance.lastUpdated.toIso8601String(),
    };

OrganizationModel _$OrganizationModelFromJson(Map<String, dynamic> json) =>
    OrganizationModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: $enumDecode(_$OrganizationTypeEnumMap, json['type']),
      status: $enumDecode(_$OrganizationStatusEnumMap, json['status']),
      contact:
          OrganizationContact.fromJson(json['contact'] as Map<String, dynamic>),
      settings: OrganizationSettings.fromJson(
          json['settings'] as Map<String, dynamic>),
      stats: OrganizationStats.fromJson(json['stats'] as Map<String, dynamic>),
      createdBy: json['createdBy'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      logoUrl: json['logoUrl'] as String?,
      bannerUrl: json['bannerUrl'] as String?,
      subscriptionPlan: json['subscriptionPlan'] as String?,
      subscriptionExpiresAt: json['subscriptionExpiresAt'] == null
          ? null
          : DateTime.parse(json['subscriptionExpiresAt'] as String),
      isPaid: json['isPaid'] as bool? ?? false,
      adminUserIds: (json['adminUserIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      ministryLeaderIds: (json['ministryLeaderIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      customFields: json['customFields'] as Map<String, dynamic>?,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$OrganizationModelToJson(OrganizationModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'type': _$OrganizationTypeEnumMap[instance.type]!,
      'status': _$OrganizationStatusEnumMap[instance.status]!,
      'logoUrl': instance.logoUrl,
      'bannerUrl': instance.bannerUrl,
      'contact': instance.contact.toJson(),
      'settings': instance.settings.toJson(),
      'stats': instance.stats.toJson(),
      'createdBy': instance.createdBy,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'subscriptionPlan': instance.subscriptionPlan,
      'subscriptionExpiresAt':
          instance.subscriptionExpiresAt?.toIso8601String(),
      'isPaid': instance.isPaid,
      'adminUserIds': instance.adminUserIds,
      'ministryLeaderIds': instance.ministryLeaderIds,
      'customFields': instance.customFields,
      'tags': instance.tags,
    };

const _$OrganizationTypeEnumMap = {
  OrganizationType.church: 'church',
  OrganizationType.ministry: 'ministry',
  OrganizationType.nonprofit: 'nonprofit',
  OrganizationType.communityGroup: 'community_group',
  OrganizationType.other: 'other',
};

const _$OrganizationStatusEnumMap = {
  OrganizationStatus.active: 'active',
  OrganizationStatus.inactive: 'inactive',
  OrganizationStatus.suspended: 'suspended',
  OrganizationStatus.trial: 'trial',
};
