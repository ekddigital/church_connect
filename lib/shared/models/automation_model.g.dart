// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'automation_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AutomationTrigger _$AutomationTriggerFromJson(Map<String, dynamic> json) =>
    AutomationTrigger(
      type: $enumDecode(_$AutomationTriggerTypeEnumMap, json['type']),
      conditions: json['conditions'] as Map<String, dynamic>,
      schedule: json['schedule'] as Map<String, dynamic>?,
      isRecurring: json['isRecurring'] as bool? ?? false,
      maxExecutions: (json['maxExecutions'] as num?)?.toInt(),
      startDate: json['startDate'] == null
          ? null
          : DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] == null
          ? null
          : DateTime.parse(json['endDate'] as String),
    );

Map<String, dynamic> _$AutomationTriggerToJson(AutomationTrigger instance) =>
    <String, dynamic>{
      'type': _$AutomationTriggerTypeEnumMap[instance.type]!,
      'conditions': instance.conditions,
      'schedule': instance.schedule,
      'isRecurring': instance.isRecurring,
      'maxExecutions': instance.maxExecutions,
      'startDate': instance.startDate?.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
    };

const _$AutomationTriggerTypeEnumMap = {
  AutomationTriggerType.memberJoin: 'member_join',
  AutomationTriggerType.birthday: 'birthday',
  AutomationTriggerType.anniversary: 'anniversary',
  AutomationTriggerType.prayerRequest: 'prayer_request',
  AutomationTriggerType.absenceDetected: 'absence_detected',
  AutomationTriggerType.careStatusChange: 'care_status_change',
  AutomationTriggerType.dateBased: 'date_based',
  AutomationTriggerType.manual: 'manual',
  AutomationTriggerType.apiWebhook: 'api_webhook',
};

AutomationAction _$AutomationActionFromJson(Map<String, dynamic> json) =>
    AutomationAction(
      id: json['id'] as String,
      type: $enumDecode(_$AutomationActionTypeEnumMap, json['type']),
      parameters: json['parameters'] as Map<String, dynamic>,
      executionOrder: (json['executionOrder'] as num?)?.toInt() ?? 0,
      delayMinutes: (json['delayMinutes'] as num?)?.toInt(),
      conditions: json['conditions'] as Map<String, dynamic>?,
      isRequired: json['isRequired'] as bool? ?? true,
    );

Map<String, dynamic> _$AutomationActionToJson(AutomationAction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$AutomationActionTypeEnumMap[instance.type]!,
      'parameters': instance.parameters,
      'executionOrder': instance.executionOrder,
      'delayMinutes': instance.delayMinutes,
      'conditions': instance.conditions,
      'isRequired': instance.isRequired,
    };

const _$AutomationActionTypeEnumMap = {
  AutomationActionType.sendMessage: 'send_message',
  AutomationActionType.assignCareLevel: 'assign_care_level',
  AutomationActionType.createTask: 'create_task',
  AutomationActionType.scheduleVisit: 'schedule_visit',
  AutomationActionType.addToGroup: 'add_to_group',
  AutomationActionType.updateMemberField: 'update_member_field',
  AutomationActionType.sendNotification: 'send_notification',
};

AutomationStats _$AutomationStatsFromJson(Map<String, dynamic> json) =>
    AutomationStats(
      totalExecutions: (json['totalExecutions'] as num?)?.toInt() ?? 0,
      successfulExecutions:
          (json['successfulExecutions'] as num?)?.toInt() ?? 0,
      failedExecutions: (json['failedExecutions'] as num?)?.toInt() ?? 0,
      monthlyExecutions: (json['monthlyExecutions'] as num?)?.toInt() ?? 0,
      lastExecuted: json['lastExecuted'] == null
          ? null
          : DateTime.parse(json['lastExecuted'] as String),
      nextScheduledExecution: json['nextScheduledExecution'] == null
          ? null
          : DateTime.parse(json['nextScheduledExecution'] as String),
      successRate: (json['successRate'] as num?)?.toDouble() ?? 0.0,
      averageExecutionTimeMs:
          (json['averageExecutionTimeMs'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$AutomationStatsToJson(AutomationStats instance) =>
    <String, dynamic>{
      'totalExecutions': instance.totalExecutions,
      'successfulExecutions': instance.successfulExecutions,
      'failedExecutions': instance.failedExecutions,
      'monthlyExecutions': instance.monthlyExecutions,
      'lastExecuted': instance.lastExecuted?.toIso8601String(),
      'nextScheduledExecution':
          instance.nextScheduledExecution?.toIso8601String(),
      'successRate': instance.successRate,
      'averageExecutionTimeMs': instance.averageExecutionTimeMs,
    };

AutomationModel _$AutomationModelFromJson(Map<String, dynamic> json) =>
    AutomationModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      status: $enumDecode(_$AutomationStatusEnumMap, json['status']),
      trigger:
          AutomationTrigger.fromJson(json['trigger'] as Map<String, dynamic>),
      actions: (json['actions'] as List<dynamic>)
          .map((e) => AutomationAction.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdBy: json['createdBy'] as String,
      createdByName: json['createdByName'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      stats: AutomationStats.fromJson(json['stats'] as Map<String, dynamic>),
      conditions: json['conditions'] as Map<String, dynamic>?,
      organizationId: json['organizationId'] as String?,
      targetMemberGroups: (json['targetMemberGroups'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      variables: json['variables'] as Map<String, dynamic>?,
      isSystemAutomation: json['isSystemAutomation'] as bool? ?? false,
      priority: (json['priority'] as num?)?.toInt() ?? 5,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
      metadata: json['metadata'] as Map<String, dynamic>?,
      version: json['version'] as String?,
    );

Map<String, dynamic> _$AutomationModelToJson(AutomationModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'status': _$AutomationStatusEnumMap[instance.status]!,
      'trigger': instance.trigger.toJson(),
      'actions': instance.actions.map((e) => e.toJson()).toList(),
      'conditions': instance.conditions,
      'createdBy': instance.createdBy,
      'createdByName': instance.createdByName,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'organizationId': instance.organizationId,
      'targetMemberGroups': instance.targetMemberGroups,
      'variables': instance.variables,
      'stats': instance.stats.toJson(),
      'isSystemAutomation': instance.isSystemAutomation,
      'priority': instance.priority,
      'tags': instance.tags,
      'metadata': instance.metadata,
      'version': instance.version,
    };

const _$AutomationStatusEnumMap = {
  AutomationStatus.active: 'active',
  AutomationStatus.inactive: 'inactive',
  AutomationStatus.paused: 'paused',
  AutomationStatus.draft: 'draft',
};
