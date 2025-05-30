import 'package:json_annotation/json_annotation.dart';

part 'message_model.g.dart';

/// Enum for message types
enum MessageType {
  @JsonValue('individual')
  individual,
  @JsonValue('group')
  group,
  @JsonValue('broadcast')
  broadcast,
  @JsonValue('automated')
  automated,
}

/// Enum for message status
enum MessageStatus {
  @JsonValue('draft')
  draft,
  @JsonValue('scheduled')
  scheduled,
  @JsonValue('sent')
  sent,
  @JsonValue('delivered')
  delivered,
  @JsonValue('read')
  read,
  @JsonValue('failed')
  failed,
}

/// Enum for message priority
enum MessagePriority {
  @JsonValue('low')
  low,
  @JsonValue('normal')
  normal,
  @JsonValue('high')
  high,
  @JsonValue('urgent')
  urgent,
}

/// Model representing a message in the ChurchConnect system
@JsonSerializable(explicitToJson: true)
class MessageModel {
  final String id;
  final String subject;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final MessagePriority priority;

  final String senderId;
  final String senderName;
  final List<String> recipientIds;
  final List<String> recipientNames;

  final String? templateId;
  final String? groupId;
  final String? campaignId;

  final DateTime createdAt;
  final DateTime? scheduledAt;
  final DateTime? sentAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;

  final Map<String, dynamic>? metadata;
  final List<String>? attachments;
  final Map<String, String>? personalizations;

  final bool isAutomated;
  final String? automationTrigger;
  final Map<String, dynamic>? automationContext;

  final int deliveryAttempts;
  final String? failureReason;
  final double? deliveryRate;
  final double? readRate;

  const MessageModel({
    required this.id,
    required this.subject,
    required this.content,
    required this.type,
    required this.status,
    required this.priority,
    required this.senderId,
    required this.senderName,
    required this.recipientIds,
    required this.recipientNames,
    required this.createdAt,
    this.templateId,
    this.groupId,
    this.campaignId,
    this.scheduledAt,
    this.sentAt,
    this.deliveredAt,
    this.readAt,
    this.metadata,
    this.attachments,
    this.personalizations,
    this.isAutomated = false,
    this.automationTrigger,
    this.automationContext,
    this.deliveryAttempts = 0,
    this.failureReason,
    this.deliveryRate,
    this.readRate,
  });

  /// Factory constructor for creating a MessageModel from JSON
  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);

  /// Convert MessageModel to JSON
  Map<String, dynamic> toJson() => _$MessageModelToJson(this);

  /// Create a copy of the message with updated fields
  MessageModel copyWith({
    String? id,
    String? subject,
    String? content,
    MessageType? type,
    MessageStatus? status,
    MessagePriority? priority,
    String? senderId,
    String? senderName,
    List<String>? recipientIds,
    List<String>? recipientNames,
    String? templateId,
    String? groupId,
    String? campaignId,
    DateTime? createdAt,
    DateTime? scheduledAt,
    DateTime? sentAt,
    DateTime? deliveredAt,
    DateTime? readAt,
    Map<String, dynamic>? metadata,
    List<String>? attachments,
    Map<String, String>? personalizations,
    bool? isAutomated,
    String? automationTrigger,
    Map<String, dynamic>? automationContext,
    int? deliveryAttempts,
    String? failureReason,
    double? deliveryRate,
    double? readRate,
  }) {
    return MessageModel(
      id: id ?? this.id,
      subject: subject ?? this.subject,
      content: content ?? this.content,
      type: type ?? this.type,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      recipientIds: recipientIds ?? this.recipientIds,
      recipientNames: recipientNames ?? this.recipientNames,
      templateId: templateId ?? this.templateId,
      groupId: groupId ?? this.groupId,
      campaignId: campaignId ?? this.campaignId,
      createdAt: createdAt ?? this.createdAt,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      sentAt: sentAt ?? this.sentAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      readAt: readAt ?? this.readAt,
      metadata: metadata ?? this.metadata,
      attachments: attachments ?? this.attachments,
      personalizations: personalizations ?? this.personalizations,
      isAutomated: isAutomated ?? this.isAutomated,
      automationTrigger: automationTrigger ?? this.automationTrigger,
      automationContext: automationContext ?? this.automationContext,
      deliveryAttempts: deliveryAttempts ?? this.deliveryAttempts,
      failureReason: failureReason ?? this.failureReason,
      deliveryRate: deliveryRate ?? this.deliveryRate,
      readRate: readRate ?? this.readRate,
    );
  }

  /// Check if message is delivered
  bool get isDelivered =>
      status == MessageStatus.delivered || status == MessageStatus.read;

  /// Check if message is read
  bool get isRead => status == MessageStatus.read;

  /// Check if message is pending
  bool get isPending =>
      status == MessageStatus.draft || status == MessageStatus.scheduled;

  /// Check if message failed
  bool get isFailed => status == MessageStatus.failed;

  /// Get delivery status percentage
  double get deliveryPercentage {
    if (deliveryRate != null) return deliveryRate! * 100;
    return isDelivered ? 100.0 : 0.0;
  }

  /// Get read status percentage
  double get readPercentage {
    if (readRate != null) return readRate! * 100;
    return isRead ? 100.0 : 0.0;
  }

  /// Get number of recipients
  int get recipientCount => recipientIds.length;

  /// Check if message has high priority
  bool get isHighPriority =>
      priority == MessagePriority.high || priority == MessagePriority.urgent;

  /// Check if message is scheduled for future
  bool get isScheduledForFuture {
    if (scheduledAt == null) return false;
    return scheduledAt!.isAfter(DateTime.now());
  }

  /// Get time until scheduled delivery
  Duration? get timeUntilDelivery {
    if (scheduledAt == null) return null;
    final now = DateTime.now();
    if (scheduledAt!.isBefore(now)) return null;
    return scheduledAt!.difference(now);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MessageModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'MessageModel{id: $id, subject: $subject, type: $type, status: $status, priority: $priority, recipientCount: $recipientCount}';
  }
}
