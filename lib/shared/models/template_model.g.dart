// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'template_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TemplateVariable _$TemplateVariableFromJson(Map<String, dynamic> json) =>
    TemplateVariable(
      name: json['name'] as String,
      displayName: json['displayName'] as String,
      description: json['description'] as String,
      defaultValue: json['defaultValue'] as String? ?? '',
      isRequired: json['isRequired'] as bool? ?? false,
      validationPattern: json['validationPattern'] as String?,
      allowedValues: (json['allowedValues'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$TemplateVariableToJson(TemplateVariable instance) =>
    <String, dynamic>{
      'name': instance.name,
      'displayName': instance.displayName,
      'description': instance.description,
      'defaultValue': instance.defaultValue,
      'isRequired': instance.isRequired,
      'validationPattern': instance.validationPattern,
      'allowedValues': instance.allowedValues,
    };

TemplateUsageStats _$TemplateUsageStatsFromJson(Map<String, dynamic> json) =>
    TemplateUsageStats(
      totalUsage: (json['totalUsage'] as num?)?.toInt() ?? 0,
      monthlyUsage: (json['monthlyUsage'] as num?)?.toInt() ?? 0,
      averageDeliveryRate:
          (json['averageDeliveryRate'] as num?)?.toDouble() ?? 0.0,
      averageReadRate: (json['averageReadRate'] as num?)?.toDouble() ?? 0.0,
      lastUsed: DateTime.parse(json['lastUsed'] as String),
      successfulDeliveries:
          (json['successfulDeliveries'] as num?)?.toInt() ?? 0,
      failedDeliveries: (json['failedDeliveries'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$TemplateUsageStatsToJson(TemplateUsageStats instance) =>
    <String, dynamic>{
      'totalUsage': instance.totalUsage,
      'monthlyUsage': instance.monthlyUsage,
      'averageDeliveryRate': instance.averageDeliveryRate,
      'averageReadRate': instance.averageReadRate,
      'lastUsed': instance.lastUsed.toIso8601String(),
      'successfulDeliveries': instance.successfulDeliveries,
      'failedDeliveries': instance.failedDeliveries,
    };

TemplateModel _$TemplateModelFromJson(Map<String, dynamic> json) =>
    TemplateModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: $enumDecode(_$TemplateTypeEnumMap, json['type']),
      category: $enumDecode(_$TemplateCategoryEnumMap, json['category']),
      status: $enumDecode(_$TemplateStatusEnumMap, json['status']),
      subject: json['subject'] as String,
      content: json['content'] as String,
      variables: (json['variables'] as List<dynamic>)
          .map((e) => TemplateVariable.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdBy: json['createdBy'] as String,
      createdByName: json['createdByName'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isSystemTemplate: json['isSystemTemplate'] as bool? ?? false,
      isPersonalized: json['isPersonalized'] as bool? ?? false,
      isAutomationEnabled: json['isAutomationEnabled'] as bool? ?? false,
      automationTriggers: json['automationTriggers'] as Map<String, dynamic>?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
      usageStats: json['usageStats'] == null
          ? null
          : TemplateUsageStats.fromJson(
              json['usageStats'] as Map<String, dynamic>),
      organizationId: json['organizationId'] as String?,
      allowedRoles: (json['allowedRoles'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      previewImage: json['previewImage'] as String?,
      translations: (json['translations'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
    );

Map<String, dynamic> _$TemplateModelToJson(TemplateModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'type': _$TemplateTypeEnumMap[instance.type]!,
      'category': _$TemplateCategoryEnumMap[instance.category]!,
      'status': _$TemplateStatusEnumMap[instance.status]!,
      'subject': instance.subject,
      'content': instance.content,
      'variables': instance.variables.map((e) => e.toJson()).toList(),
      'createdBy': instance.createdBy,
      'createdByName': instance.createdByName,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'isSystemTemplate': instance.isSystemTemplate,
      'isPersonalized': instance.isPersonalized,
      'isAutomationEnabled': instance.isAutomationEnabled,
      'automationTriggers': instance.automationTriggers,
      'metadata': instance.metadata,
      'tags': instance.tags,
      'usageStats': instance.usageStats?.toJson(),
      'organizationId': instance.organizationId,
      'allowedRoles': instance.allowedRoles,
      'previewImage': instance.previewImage,
      'translations': instance.translations,
    };

const _$TemplateTypeEnumMap = {
  TemplateType.welcome: 'welcome',
  TemplateType.prayerRequest: 'prayer_request',
  TemplateType.followUp: 'follow_up',
  TemplateType.birthday: 'birthday',
  TemplateType.anniversary: 'anniversary',
  TemplateType.spiritualCare: 'spiritual_care',
  TemplateType.physicalCare: 'physical_care',
  TemplateType.moralSupport: 'moral_support',
  TemplateType.visitReminder: 'visit_reminder',
  TemplateType.eventInvitation: 'event_invitation',
  TemplateType.donationRequest: 'donation_request',
  TemplateType.newsletter: 'newsletter',
  TemplateType.announcement: 'announcement',
  TemplateType.emergency: 'emergency',
  TemplateType.custom: 'custom',
};

const _$TemplateCategoryEnumMap = {
  TemplateCategory.spiritualCare: 'spiritual_care',
  TemplateCategory.pastoralCare: 'pastoral_care',
  TemplateCategory.administrative: 'administrative',
  TemplateCategory.events: 'events',
  TemplateCategory.communication: 'communication',
  TemplateCategory.automation: 'automation',
  TemplateCategory.personal: 'personal',
};

const _$TemplateStatusEnumMap = {
  TemplateStatus.active: 'active',
  TemplateStatus.inactive: 'inactive',
  TemplateStatus.draft: 'draft',
  TemplateStatus.archived: 'archived',
};
