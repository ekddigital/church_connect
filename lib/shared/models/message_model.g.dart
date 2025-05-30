// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageModel _$MessageModelFromJson(Map<String, dynamic> json) => MessageModel(
      id: json['id'] as String,
      subject: json['subject'] as String,
      content: json['content'] as String,
      type: $enumDecode(_$MessageTypeEnumMap, json['type']),
      status: $enumDecode(_$MessageStatusEnumMap, json['status']),
      priority: $enumDecode(_$MessagePriorityEnumMap, json['priority']),
      senderId: json['senderId'] as String,
      senderName: json['senderName'] as String,
      recipientIds: (json['recipientIds'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      recipientNames: (json['recipientNames'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      templateId: json['templateId'] as String?,
      groupId: json['groupId'] as String?,
      campaignId: json['campaignId'] as String?,
      scheduledAt: json['scheduledAt'] == null
          ? null
          : DateTime.parse(json['scheduledAt'] as String),
      sentAt: json['sentAt'] == null
          ? null
          : DateTime.parse(json['sentAt'] as String),
      deliveredAt: json['deliveredAt'] == null
          ? null
          : DateTime.parse(json['deliveredAt'] as String),
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
      attachments: (json['attachments'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      personalizations:
          (json['personalizations'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
      isAutomated: json['isAutomated'] as bool? ?? false,
      automationTrigger: json['automationTrigger'] as String?,
      automationContext: json['automationContext'] as Map<String, dynamic>?,
      deliveryAttempts: (json['deliveryAttempts'] as num?)?.toInt() ?? 0,
      failureReason: json['failureReason'] as String?,
      deliveryRate: (json['deliveryRate'] as num?)?.toDouble(),
      readRate: (json['readRate'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$MessageModelToJson(MessageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'subject': instance.subject,
      'content': instance.content,
      'type': _$MessageTypeEnumMap[instance.type]!,
      'status': _$MessageStatusEnumMap[instance.status]!,
      'priority': _$MessagePriorityEnumMap[instance.priority]!,
      'senderId': instance.senderId,
      'senderName': instance.senderName,
      'recipientIds': instance.recipientIds,
      'recipientNames': instance.recipientNames,
      'templateId': instance.templateId,
      'groupId': instance.groupId,
      'campaignId': instance.campaignId,
      'createdAt': instance.createdAt.toIso8601String(),
      'scheduledAt': instance.scheduledAt?.toIso8601String(),
      'sentAt': instance.sentAt?.toIso8601String(),
      'deliveredAt': instance.deliveredAt?.toIso8601String(),
      'readAt': instance.readAt?.toIso8601String(),
      'metadata': instance.metadata,
      'attachments': instance.attachments,
      'personalizations': instance.personalizations,
      'isAutomated': instance.isAutomated,
      'automationTrigger': instance.automationTrigger,
      'automationContext': instance.automationContext,
      'deliveryAttempts': instance.deliveryAttempts,
      'failureReason': instance.failureReason,
      'deliveryRate': instance.deliveryRate,
      'readRate': instance.readRate,
    };

const _$MessageTypeEnumMap = {
  MessageType.individual: 'individual',
  MessageType.group: 'group',
  MessageType.broadcast: 'broadcast',
  MessageType.automated: 'automated',
};

const _$MessageStatusEnumMap = {
  MessageStatus.draft: 'draft',
  MessageStatus.scheduled: 'scheduled',
  MessageStatus.sent: 'sent',
  MessageStatus.delivered: 'delivered',
  MessageStatus.read: 'read',
  MessageStatus.failed: 'failed',
};

const _$MessagePriorityEnumMap = {
  MessagePriority.low: 'low',
  MessagePriority.normal: 'normal',
  MessagePriority.high: 'high',
  MessagePriority.urgent: 'urgent',
};
