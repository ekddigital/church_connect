import 'package:json_annotation/json_annotation.dart';

part 'template_model.g.dart';

/// Enum for template types
enum TemplateType {
  @JsonValue('welcome')
  welcome,
  @JsonValue('prayer_request')
  prayerRequest,
  @JsonValue('follow_up')
  followUp,
  @JsonValue('birthday')
  birthday,
  @JsonValue('anniversary')
  anniversary,
  @JsonValue('spiritual_care')
  spiritualCare,
  @JsonValue('physical_care')
  physicalCare,
  @JsonValue('moral_support')
  moralSupport,
  @JsonValue('visit_reminder')
  visitReminder,
  @JsonValue('event_invitation')
  eventInvitation,
  @JsonValue('donation_request')
  donationRequest,
  @JsonValue('newsletter')
  newsletter,
  @JsonValue('announcement')
  announcement,
  @JsonValue('emergency')
  emergency,
  @JsonValue('custom')
  custom,
}

/// Enum for template categories
enum TemplateCategory {
  @JsonValue('spiritual_care')
  spiritualCare,
  @JsonValue('pastoral_care')
  pastoralCare,
  @JsonValue('administrative')
  administrative,
  @JsonValue('events')
  events,
  @JsonValue('communication')
  communication,
  @JsonValue('automation')
  automation,
  @JsonValue('personal')
  personal,
}

/// Enum for template status
enum TemplateStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('draft')
  draft,
  @JsonValue('archived')
  archived,
}

/// Model representing variable placeholders in templates
@JsonSerializable()
class TemplateVariable {
  final String name;
  final String displayName;
  final String description;
  final String defaultValue;
  final bool isRequired;
  final String? validationPattern;
  final List<String>? allowedValues;

  const TemplateVariable({
    required this.name,
    required this.displayName,
    required this.description,
    this.defaultValue = '',
    this.isRequired = false,
    this.validationPattern,
    this.allowedValues,
  });

  factory TemplateVariable.fromJson(Map<String, dynamic> json) =>
      _$TemplateVariableFromJson(json);

  Map<String, dynamic> toJson() => _$TemplateVariableToJson(this);
}

/// Model representing usage statistics for templates
@JsonSerializable()
class TemplateUsageStats {
  final int totalUsage;
  final int monthlyUsage;
  final double averageDeliveryRate;
  final double averageReadRate;
  final DateTime lastUsed;
  final int successfulDeliveries;
  final int failedDeliveries;

  const TemplateUsageStats({
    this.totalUsage = 0,
    this.monthlyUsage = 0,
    this.averageDeliveryRate = 0.0,
    this.averageReadRate = 0.0,
    required this.lastUsed,
    this.successfulDeliveries = 0,
    this.failedDeliveries = 0,
  });

  factory TemplateUsageStats.fromJson(Map<String, dynamic> json) =>
      _$TemplateUsageStatsFromJson(json);

  Map<String, dynamic> toJson() => _$TemplateUsageStatsToJson(this);
}

/// Model representing a message template in the ChurchConnect system
@JsonSerializable(explicitToJson: true)
class TemplateModel {
  final String id;
  final String name;
  final String description;
  final TemplateType type;
  final TemplateCategory category;
  final TemplateStatus status;

  final String subject;
  final String content;
  final List<TemplateVariable> variables;

  final String createdBy;
  final String createdByName;
  final DateTime createdAt;
  final DateTime updatedAt;

  final bool isSystemTemplate;
  final bool isPersonalized;
  final bool isAutomationEnabled;

  final Map<String, dynamic>? automationTriggers;
  final Map<String, dynamic>? metadata;
  final List<String>? tags;

  final TemplateUsageStats? usageStats;
  final String? organizationId;
  final List<String>? allowedRoles;

  final String? previewImage;
  final Map<String, String>? translations;

  const TemplateModel({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.category,
    required this.status,
    required this.subject,
    required this.content,
    required this.variables,
    required this.createdBy,
    required this.createdByName,
    required this.createdAt,
    required this.updatedAt,
    this.isSystemTemplate = false,
    this.isPersonalized = false,
    this.isAutomationEnabled = false,
    this.automationTriggers,
    this.metadata,
    this.tags,
    this.usageStats,
    this.organizationId,
    this.allowedRoles,
    this.previewImage,
    this.translations,
  });

  /// Factory constructor for creating a TemplateModel from JSON
  factory TemplateModel.fromJson(Map<String, dynamic> json) =>
      _$TemplateModelFromJson(json);

  /// Convert TemplateModel to JSON
  Map<String, dynamic> toJson() => _$TemplateModelToJson(this);

  /// Create a copy of the template with updated fields
  TemplateModel copyWith({
    String? id,
    String? name,
    String? description,
    TemplateType? type,
    TemplateCategory? category,
    TemplateStatus? status,
    String? subject,
    String? content,
    List<TemplateVariable>? variables,
    String? createdBy,
    String? createdByName,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isSystemTemplate,
    bool? isPersonalized,
    bool? isAutomationEnabled,
    Map<String, dynamic>? automationTriggers,
    Map<String, dynamic>? metadata,
    List<String>? tags,
    TemplateUsageStats? usageStats,
    String? organizationId,
    List<String>? allowedRoles,
    String? previewImage,
    Map<String, String>? translations,
  }) {
    return TemplateModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      category: category ?? this.category,
      status: status ?? this.status,
      subject: subject ?? this.subject,
      content: content ?? this.content,
      variables: variables ?? this.variables,
      createdBy: createdBy ?? this.createdBy,
      createdByName: createdByName ?? this.createdByName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isSystemTemplate: isSystemTemplate ?? this.isSystemTemplate,
      isPersonalized: isPersonalized ?? this.isPersonalized,
      isAutomationEnabled: isAutomationEnabled ?? this.isAutomationEnabled,
      automationTriggers: automationTriggers ?? this.automationTriggers,
      metadata: metadata ?? this.metadata,
      tags: tags ?? this.tags,
      usageStats: usageStats ?? this.usageStats,
      organizationId: organizationId ?? this.organizationId,
      allowedRoles: allowedRoles ?? this.allowedRoles,
      previewImage: previewImage ?? this.previewImage,
      translations: translations ?? this.translations,
    );
  }

  /// Get template content with variables replaced
  String getContentWithVariables(Map<String, String> variableValues) {
    String processedContent = content;

    for (final variable in variables) {
      final value = variableValues[variable.name] ?? variable.defaultValue;
      processedContent = processedContent.replaceAll(
        '{{${variable.name}}}',
        value,
      );
    }

    return processedContent;
  }

  /// Get subject with variables replaced
  String getSubjectWithVariables(Map<String, String> variableValues) {
    String processedSubject = subject;

    for (final variable in variables) {
      final value = variableValues[variable.name] ?? variable.defaultValue;
      processedSubject = processedSubject.replaceAll(
        '{{${variable.name}}}',
        value,
      );
    }

    return processedSubject;
  }

  /// Get list of variable names found in content
  List<String> getVariableNamesInContent() {
    final RegExp regex = RegExp(r'\{\{(\w+)\}\}');
    final matches = regex.allMatches(content + ' ' + subject);
    return matches.map((match) => match.group(1)!).toSet().toList();
  }

  /// Validate that all required variables are provided
  List<String> validateRequiredVariables(Map<String, String> variableValues) {
    final missingVariables = <String>[];

    for (final variable in variables) {
      if (variable.isRequired &&
          (!variableValues.containsKey(variable.name) ||
              variableValues[variable.name]!.isEmpty)) {
        missingVariables.add(variable.name);
      }
    }

    return missingVariables;
  }

  /// Check if template is active and usable
  bool get isActive => status == TemplateStatus.active;

  /// Check if template is a draft
  bool get isDraft => status == TemplateStatus.draft;

  /// Check if template is archived
  bool get isArchived => status == TemplateStatus.archived;

  /// Get usage rate (monthly usage / total usage)
  double get usageRate {
    if (usageStats == null || usageStats!.totalUsage == 0) return 0.0;
    return usageStats!.monthlyUsage / usageStats!.totalUsage;
  }

  /// Get success rate (successful / total deliveries)
  double get successRate {
    if (usageStats == null) return 0.0;
    final total =
        usageStats!.successfulDeliveries + usageStats!.failedDeliveries;
    if (total == 0) return 0.0;
    return usageStats!.successfulDeliveries / total;
  }

  /// Check if user role can use this template
  bool canBeUsedByRole(String userRole) {
    if (allowedRoles == null || allowedRoles!.isEmpty) return true;
    return allowedRoles!.contains(userRole);
  }

  /// Get template age in days
  int get ageInDays {
    return DateTime.now().difference(createdAt).inDays;
  }

  /// Check if template has been used recently (within 30 days)
  bool get isRecentlyUsed {
    if (usageStats?.lastUsed == null) return false;
    return DateTime.now().difference(usageStats!.lastUsed).inDays <= 30;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TemplateModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'TemplateModel{id: $id, name: $name, type: $type, category: $category, status: $status}';
  }
}
