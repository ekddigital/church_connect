import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/message_model.dart';
import '../models/template_model.dart';
import 'api_service.dart';

/// Messaging API service for handling communications
class MessagingApiService {
  final ApiService _apiService;

  MessagingApiService(this._apiService);

  /// Send message to recipients
  Future<MessageResponse> sendMessage({
    required String content,
    required List<String> recipientIds,
    required String type, // 'email', 'sms', 'notification'
    String? templateId,
    Map<String, dynamic>? variables,
    DateTime? scheduledFor,
  }) async {
    final response = await _apiService.post('/messages', data: {
      'content': content,
      'recipientIds': recipientIds,
      'type': type,
      if (templateId != null) 'templateId': templateId,
      if (variables != null) 'variables': variables,
      if (scheduledFor != null) 'scheduledFor': scheduledFor.toIso8601String(),
    });

    return MessageResponse.fromJson(response.data);
  }

  /// Send bulk message to multiple recipients
  Future<BulkMessageResponse> sendBulkMessage({
    required String content,
    required List<String> recipientIds,
    required String type,
    String? templateId,
    Map<String, dynamic>? variables,
  }) async {
    final response = await _apiService.post('/messages/bulk', data: {
      'content': content,
      'recipientIds': recipientIds,
      'type': type,
      if (templateId != null) 'templateId': templateId,
      if (variables != null) 'variables': variables,
    });

    return BulkMessageResponse.fromJson(response.data);
  }

  /// Get message history with pagination
  Future<MessagesResponse> getMessages({
    int page = 1,
    int limit = 50,
    String? type,
    String? status,
    String? recipientId,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (type != null) queryParams['type'] = type;
    if (status != null) queryParams['status'] = status;
    if (recipientId != null) queryParams['recipientId'] = recipientId;

    final response =
        await _apiService.get('/messages', queryParameters: queryParams);
    return MessagesResponse.fromJson(response.data);
  }

  /// Get message by ID
  Future<MessageModel> getMessageById(String id) async {
    final response = await _apiService.get('/messages/$id');
    return MessageModel.fromJson(response.data['message']);
  }

  /// Get message delivery status
  Future<MessageDeliveryStatus> getDeliveryStatus(String messageId) async {
    final response = await _apiService.get('/messages/$messageId/status');
    return MessageDeliveryStatus.fromJson(response.data);
  }

  /// Mark message as read
  Future<void> markAsRead(String messageId) async {
    await _apiService.put('/messages/$messageId/read');
  }

  /// Cancel scheduled message
  Future<void> cancelMessage(String messageId) async {
    await _apiService.put('/messages/$messageId/cancel');
  }

  /// Get message templates
  Future<List<TemplateModel>> getTemplates({
    String? category,
    String? type,
  }) async {
    final queryParams = <String, dynamic>{};
    if (category != null) queryParams['category'] = category;
    if (type != null) queryParams['type'] = type;

    final response =
        await _apiService.get('/templates', queryParameters: queryParams);
    return (response.data['templates'] as List)
        .map((template) => TemplateModel.fromJson(template))
        .toList();
  }

  /// Create message template
  Future<TemplateModel> createTemplate({
    required String name,
    required String content,
    required String type,
    String? category,
    Map<String, dynamic>? variables,
  }) async {
    final response = await _apiService.post('/templates', data: {
      'name': name,
      'content': content,
      'type': type,
      if (category != null) 'category': category,
      if (variables != null) 'variables': variables,
    });

    return TemplateModel.fromJson(response.data['template']);
  }

  /// Update template
  Future<TemplateModel> updateTemplate(
      String id, Map<String, dynamic> updates) async {
    final response = await _apiService.put('/templates/$id', data: updates);
    return TemplateModel.fromJson(response.data['template']);
  }

  /// Delete template
  Future<void> deleteTemplate(String id) async {
    await _apiService.delete('/templates/$id');
  }

  /// Get messaging analytics
  Future<MessagingAnalytics> getAnalytics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final queryParams = <String, dynamic>{};
    if (startDate != null)
      queryParams['startDate'] = startDate.toIso8601String();
    if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

    final response = await _apiService.get('/messages/analytics',
        queryParameters: queryParams);
    return MessagingAnalytics.fromJson(response.data);
  }
}

/// Message response model
class MessageResponse {
  final bool success;
  final String? messageId;
  final String? message;

  MessageResponse({
    required this.success,
    this.messageId,
    this.message,
  });

  factory MessageResponse.fromJson(Map<String, dynamic> json) {
    return MessageResponse(
      success: json['success'],
      messageId: json['messageId'],
      message: json['message'],
    );
  }
}

/// Bulk message response model
class BulkMessageResponse {
  final bool success;
  final int totalSent;
  final int successCount;
  final int failureCount;
  final List<String> failedRecipients;

  BulkMessageResponse({
    required this.success,
    required this.totalSent,
    required this.successCount,
    required this.failureCount,
    required this.failedRecipients,
  });

  factory BulkMessageResponse.fromJson(Map<String, dynamic> json) {
    return BulkMessageResponse(
      success: json['success'],
      totalSent: json['totalSent'],
      successCount: json['successCount'],
      failureCount: json['failureCount'],
      failedRecipients: List<String>.from(json['failedRecipients'] ?? []),
    );
  }
}

/// Messages response model for paginated data
class MessagesResponse {
  final List<MessageModel> messages;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  MessagesResponse({
    required this.messages,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory MessagesResponse.fromJson(Map<String, dynamic> json) {
    return MessagesResponse(
      messages: (json['messages'] as List)
          .map((message) => MessageModel.fromJson(message))
          .toList(),
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      totalPages: json['totalPages'],
    );
  }
}

/// Message delivery status model
class MessageDeliveryStatus {
  final String messageId;
  final String status;
  final DateTime? sentAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;
  final String? errorMessage;

  MessageDeliveryStatus({
    required this.messageId,
    required this.status,
    this.sentAt,
    this.deliveredAt,
    this.readAt,
    this.errorMessage,
  });

  factory MessageDeliveryStatus.fromJson(Map<String, dynamic> json) {
    return MessageDeliveryStatus(
      messageId: json['messageId'],
      status: json['status'],
      sentAt: json['sentAt'] != null ? DateTime.parse(json['sentAt']) : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'])
          : null,
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      errorMessage: json['errorMessage'],
    );
  }
}

/// Messaging analytics model
class MessagingAnalytics {
  final int totalMessages;
  final int deliveredMessages;
  final int readMessages;
  final int failedMessages;
  final double deliveryRate;
  final double readRate;
  final Map<String, int> messagesByType;
  final Map<String, int> messagesByDay;

  MessagingAnalytics({
    required this.totalMessages,
    required this.deliveredMessages,
    required this.readMessages,
    required this.failedMessages,
    required this.deliveryRate,
    required this.readRate,
    required this.messagesByType,
    required this.messagesByDay,
  });

  factory MessagingAnalytics.fromJson(Map<String, dynamic> json) {
    return MessagingAnalytics(
      totalMessages: json['totalMessages'],
      deliveredMessages: json['deliveredMessages'],
      readMessages: json['readMessages'],
      failedMessages: json['failedMessages'],
      deliveryRate: json['deliveryRate'].toDouble(),
      readRate: json['readRate'].toDouble(),
      messagesByType: Map<String, int>.from(json['messagesByType'] ?? {}),
      messagesByDay: Map<String, int>.from(json['messagesByDay'] ?? {}),
    );
  }
}

/// Messaging API Service Provider
final messagingApiServiceProvider = Provider<MessagingApiService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return MessagingApiService(apiService);
});
