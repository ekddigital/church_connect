import 'package:json_annotation/json_annotation.dart';

part 'automation_model.g.dart';

/// Enum for automation trigger types
enum AutomationTriggerType {
  @JsonValue('member_join')
  memberJoin,
  @JsonValue('birthday')
  birthday,
  @JsonValue('anniversary')
  anniversary,
  @JsonValue('prayer_request')
  prayerRequest,
  @JsonValue('absence_detected')
  absenceDetected,
  @JsonValue('care_status_change')
  careStatusChange,
  @JsonValue('date_based')
  dateBased,
  @JsonValue('manual')
  manual,
  @JsonValue('api_webhook')
  apiWebhook,
}

/// Enum for automation status
enum AutomationStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('paused')
  paused,
  @JsonValue('draft')
  draft,
}

/// Enum for automation action types
enum AutomationActionType {
  @JsonValue('send_message')
  sendMessage,
  @JsonValue('assign_care_level')
  assignCareLevel,
  @JsonValue('create_task')
  createTask,
  @JsonValue('schedule_visit')
  scheduleVisit,
  @JsonValue('add_to_group')
  addToGroup,
  @JsonValue('update_member_field')
  updateMemberField,
  @JsonValue('send_notification')
  sendNotification,
}

/// Model representing automation trigger conditions
@JsonSerializable()
class AutomationTrigger {
  final AutomationTriggerType type;
  final Map<String, dynamic> conditions;
  final Map<String, dynamic>? schedule;
  final bool isRecurring;
  final int? maxExecutions;
  final DateTime? startDate;
  final DateTime? endDate;

  const AutomationTrigger({
    required this.type,
    required this.conditions,
    this.schedule,
    this.isRecurring = false,
    this.maxExecutions,
    this.startDate,
    this.endDate,
  });

  factory AutomationTrigger.fromJson(Map<String, dynamic> json) =>
      _$AutomationTriggerFromJson(json);

  Map<String, dynamic> toJson() => _$AutomationTriggerToJson(this);
}

/// Model representing automation actions
@JsonSerializable()
class AutomationAction {
  final String id;
  final AutomationActionType type;
  final Map<String, dynamic> parameters;
  final int executionOrder;
  final int? delayMinutes;
  final Map<String, dynamic>? conditions;
  final bool isRequired;

  const AutomationAction({
    required this.id,
    required this.type,
    required this.parameters,
    this.executionOrder = 0,
    this.delayMinutes,
    this.conditions,
    this.isRequired = true,
  });

  factory AutomationAction.fromJson(Map<String, dynamic> json) =>
      _$AutomationActionFromJson(json);

  Map<String, dynamic> toJson() => _$AutomationActionToJson(this);
}

/// Model representing automation execution statistics
@JsonSerializable()
class AutomationStats {
  final int totalExecutions;
  final int successfulExecutions;
  final int failedExecutions;
  final int monthlyExecutions;
  final DateTime? lastExecuted;
  final DateTime? nextScheduledExecution;
  final double successRate;
  final int averageExecutionTimeMs;

  const AutomationStats({
    this.totalExecutions = 0,
    this.successfulExecutions = 0,
    this.failedExecutions = 0,
    this.monthlyExecutions = 0,
    this.lastExecuted,
    this.nextScheduledExecution,
    this.successRate = 0.0,
    this.averageExecutionTimeMs = 0,
  });

  factory AutomationStats.fromJson(Map<String, dynamic> json) =>
      _$AutomationStatsFromJson(json);

  Map<String, dynamic> toJson() => _$AutomationStatsToJson(this);
}

/// Model representing an automation workflow in the ChurchConnect system
@JsonSerializable(explicitToJson: true)
class AutomationModel {
  final String id;
  final String name;
  final String description;
  final AutomationStatus status;

  final AutomationTrigger trigger;
  final List<AutomationAction> actions;
  final Map<String, dynamic>? conditions;

  final String createdBy;
  final String createdByName;
  final DateTime createdAt;
  final DateTime updatedAt;

  final String? organizationId;
  final List<String>? targetMemberGroups;
  final Map<String, dynamic>? variables;

  final AutomationStats stats;
  final bool isSystemAutomation;
  final int priority;
  final List<String>? tags;

  final Map<String, dynamic>? metadata;
  final String? version;

  const AutomationModel({
    required this.id,
    required this.name,
    required this.description,
    required this.status,
    required this.trigger,
    required this.actions,
    required this.createdBy,
    required this.createdByName,
    required this.createdAt,
    required this.updatedAt,
    required this.stats,
    this.conditions,
    this.organizationId,
    this.targetMemberGroups,
    this.variables,
    this.isSystemAutomation = false,
    this.priority = 5,
    this.tags,
    this.metadata,
    this.version,
  });

  /// Factory constructor for creating an AutomationModel from JSON
  factory AutomationModel.fromJson(Map<String, dynamic> json) =>
      _$AutomationModelFromJson(json);

  /// Convert AutomationModel to JSON
  Map<String, dynamic> toJson() => _$AutomationModelToJson(this);

  /// Create a copy of the automation with updated fields
  AutomationModel copyWith({
    String? id,
    String? name,
    String? description,
    AutomationStatus? status,
    AutomationTrigger? trigger,
    List<AutomationAction>? actions,
    Map<String, dynamic>? conditions,
    String? createdBy,
    String? createdByName,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? organizationId,
    List<String>? targetMemberGroups,
    Map<String, dynamic>? variables,
    AutomationStats? stats,
    bool? isSystemAutomation,
    int? priority,
    List<String>? tags,
    Map<String, dynamic>? metadata,
    String? version,
  }) {
    return AutomationModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      status: status ?? this.status,
      trigger: trigger ?? this.trigger,
      actions: actions ?? this.actions,
      conditions: conditions ?? this.conditions,
      createdBy: createdBy ?? this.createdBy,
      createdByName: createdByName ?? this.createdByName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      organizationId: organizationId ?? this.organizationId,
      targetMemberGroups: targetMemberGroups ?? this.targetMemberGroups,
      variables: variables ?? this.variables,
      stats: stats ?? this.stats,
      isSystemAutomation: isSystemAutomation ?? this.isSystemAutomation,
      priority: priority ?? this.priority,
      tags: tags ?? this.tags,
      metadata: metadata ?? this.metadata,
      version: version ?? this.version,
    );
  }

  /// Check if automation is active
  bool get isActive => status == AutomationStatus.active;

  /// Check if automation is paused
  bool get isPaused => status == AutomationStatus.paused;

  /// Check if automation is draft
  bool get isDraft => status == AutomationStatus.draft;

  /// Get execution success rate percentage
  double get successRatePercentage {
    if (stats.totalExecutions == 0) return 0.0;
    return (stats.successfulExecutions / stats.totalExecutions) * 100;
  }

  /// Get failure rate percentage
  double get failureRatePercentage {
    if (stats.totalExecutions == 0) return 0.0;
    return (stats.failedExecutions / stats.totalExecutions) * 100;
  }

  /// Check if automation is scheduled to run
  bool get hasScheduledExecution {
    return stats.nextScheduledExecution != null &&
        stats.nextScheduledExecution!.isAfter(DateTime.now());
  }

  /// Get time until next execution
  Duration? get timeUntilNextExecution {
    if (stats.nextScheduledExecution == null) return null;
    final now = DateTime.now();
    if (stats.nextScheduledExecution!.isBefore(now)) return null;
    return stats.nextScheduledExecution!.difference(now);
  }

  /// Check if automation was executed recently (within 24 hours)
  bool get wasExecutedRecently {
    if (stats.lastExecuted == null) return false;
    return DateTime.now().difference(stats.lastExecuted!).inHours <= 24;
  }

  /// Get actions sorted by execution order
  List<AutomationAction> get sortedActions {
    final actionsCopy = List<AutomationAction>.from(actions);
    actionsCopy.sort((a, b) => a.executionOrder.compareTo(b.executionOrder));
    return actionsCopy;
  }

  /// Get required actions only
  List<AutomationAction> get requiredActions {
    return actions.where((action) => action.isRequired).toList();
  }

  /// Get optional actions only
  List<AutomationAction> get optionalActions {
    return actions.where((action) => !action.isRequired).toList();
  }

  /// Check if automation has message sending actions
  bool get sendsMessages {
    return actions
        .any((action) => action.type == AutomationActionType.sendMessage);
  }

  /// Check if automation creates tasks
  bool get createsTasks {
    return actions
        .any((action) => action.type == AutomationActionType.createTask);
  }

  /// Check if automation schedules visits
  bool get schedulesVisits {
    return actions
        .any((action) => action.type == AutomationActionType.scheduleVisit);
  }

  /// Get automation age in days
  int get ageInDays {
    return DateTime.now().difference(createdAt).inDays;
  }

  /// Check if automation is high priority
  bool get isHighPriority => priority <= 3;

  /// Check if automation is low priority
  bool get isLowPriority => priority >= 7;

  /// Get estimated execution time in minutes
  int get estimatedExecutionTimeMinutes {
    int totalDelay = 0;
    for (final action in actions) {
      totalDelay += action.delayMinutes ?? 0;
    }
    return totalDelay + (actions.length * 2); // Base 2 minutes per action
  }

  /// Check if automation targets specific member groups
  bool get hasTargetGroups {
    return targetMemberGroups != null && targetMemberGroups!.isNotEmpty;
  }

  /// Check if automation is recurring
  bool get isRecurring => trigger.isRecurring;

  /// Check if automation has execution limits
  bool get hasExecutionLimits => trigger.maxExecutions != null;

  /// Get remaining executions
  int? get remainingExecutions {
    if (trigger.maxExecutions == null) return null;
    return trigger.maxExecutions! - stats.totalExecutions;
  }

  /// Check if automation has reached execution limit
  bool get hasReachedExecutionLimit {
    if (trigger.maxExecutions == null) return false;
    return stats.totalExecutions >= trigger.maxExecutions!;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AutomationModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'AutomationModel{id: $id, name: $name, status: $status, trigger: ${trigger.type}, actions: ${actions.length}}';
  }
}
