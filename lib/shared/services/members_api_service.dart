import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/member_model.dart';
import 'api_service.dart';

/// Members API service for managing member data
class MembersApiService {
  final ApiService _apiService;

  MembersApiService(this._apiService);

  /// Get all members with pagination and filtering
  Future<MembersResponse> getMembers({
    int page = 1,
    int limit = 50,
    String? search,
    String? status,
    String? category,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }
    if (status != null && status.isNotEmpty) {
      queryParams['status'] = status;
    }
    if (category != null && category.isNotEmpty) {
      queryParams['category'] = category;
    }

    final response =
        await _apiService.get('/members', queryParameters: queryParams);
    return MembersResponse.fromJson(response.data);
  }

  /// Get member by ID
  Future<MemberModel> getMemberById(String id) async {
    final response = await _apiService.get('/members/$id');
    return MemberModel.fromJson(response.data['member']);
  }

  /// Create new member
  Future<MemberModel> createMember(Map<String, dynamic> memberData) async {
    final response = await _apiService.post('/members', data: memberData);
    return MemberModel.fromJson(response.data['member']);
  }

  /// Update member
  Future<MemberModel> updateMember(
      String id, Map<String, dynamic> updates) async {
    final response = await _apiService.put('/members/$id', data: updates);
    return MemberModel.fromJson(response.data['member']);
  }

  /// Delete member
  Future<void> deleteMember(String id) async {
    await _apiService.delete('/members/$id');
  }

  /// Get member activity/history
  Future<List<MemberActivity>> getMemberActivity(String id) async {
    final response = await _apiService.get('/members/$id/activity');
    return (response.data['activities'] as List)
        .map((activity) => MemberActivity.fromJson(activity))
        .toList();
  }

  /// Update member care status
  Future<MemberModel> updateCareStatus({
    required String id,
    required String spiritualStatus,
    required String physicalStatus,
    required String moralStatus,
    String? notes,
  }) async {
    final response = await _apiService.put('/members/$id/care-status', data: {
      'spiritualStatus': spiritualStatus,
      'physicalStatus': physicalStatus,
      'moralStatus': moralStatus,
      if (notes != null) 'notes': notes,
    });
    return MemberModel.fromJson(response.data['member']);
  }

  /// Bulk import members
  Future<BulkImportResponse> bulkImportMembers(
      List<Map<String, dynamic>> members) async {
    final response = await _apiService.post('/members/bulk-import', data: {
      'members': members,
    });
    return BulkImportResponse.fromJson(response.data);
  }

  /// Export members
  Future<String> exportMembers({
    String format = 'csv',
    List<String>? fields,
  }) async {
    final response = await _apiService.get('/members/export', queryParameters: {
      'format': format,
      if (fields != null) 'fields': fields.join(','),
    });
    return response.data['downloadUrl'];
  }
}

/// Members response model for paginated data
class MembersResponse {
  final List<MemberModel> members;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  MembersResponse({
    required this.members,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory MembersResponse.fromJson(Map<String, dynamic> json) {
    return MembersResponse(
      members: (json['members'] as List)
          .map((member) => MemberModel.fromJson(member))
          .toList(),
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      totalPages: json['totalPages'],
    );
  }
}

/// Member activity model
class MemberActivity {
  final String id;
  final String type;
  final String description;
  final DateTime timestamp;
  final String? performedBy;

  MemberActivity({
    required this.id,
    required this.type,
    required this.description,
    required this.timestamp,
    this.performedBy,
  });

  factory MemberActivity.fromJson(Map<String, dynamic> json) {
    return MemberActivity(
      id: json['id'],
      type: json['type'],
      description: json['description'],
      timestamp: DateTime.parse(json['timestamp']),
      performedBy: json['performedBy'],
    );
  }
}

/// Bulk import response model
class BulkImportResponse {
  final bool success;
  final int totalProcessed;
  final int successCount;
  final int failureCount;
  final List<String> errors;

  BulkImportResponse({
    required this.success,
    required this.totalProcessed,
    required this.successCount,
    required this.failureCount,
    required this.errors,
  });

  factory BulkImportResponse.fromJson(Map<String, dynamic> json) {
    return BulkImportResponse(
      success: json['success'],
      totalProcessed: json['totalProcessed'],
      successCount: json['successCount'],
      failureCount: json['failureCount'],
      errors: List<String>.from(json['errors'] ?? []),
    );
  }
}

/// Members API Service Provider
final membersApiServiceProvider = Provider<MembersApiService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return MembersApiService(apiService);
});
