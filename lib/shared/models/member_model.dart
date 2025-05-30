import 'package:json_annotation/json_annotation.dart';

part 'member_model.g.dart';

/// Member Model for Church/Organization Member Management
@JsonSerializable()
class MemberModel {
  final String id;
  final String firstName;
  final String lastName;
  final String? email;
  final String? phoneNumber;
  final DateTime? birthDate;
  final Gender? gender;
  final String? address;
  final String? city;
  final String? state;
  final String? zipCode;
  final String? country;
  final MemberStatus status;
  final MemberType type;
  final String organizationId;
  final List<String> tags;
  final Map<String, dynamic>? customFields;
  final CareProfile careProfile;
  final List<String> familyMemberIds;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? notes;
  final String? photoUrl;

  const MemberModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
    this.phoneNumber,
    this.birthDate,
    this.gender,
    this.address,
    this.city,
    this.state,
    this.zipCode,
    this.country,
    this.status = MemberStatus.active,
    this.type = MemberType.member,
    required this.organizationId,
    this.tags = const [],
    this.customFields,
    required this.careProfile,
    this.familyMemberIds = const [],
    required this.createdAt,
    required this.updatedAt,
    this.notes,
    this.photoUrl,
  });

  String get fullName => '$firstName $lastName';

  String get displayName => fullName;

  bool get hasContact => email != null || phoneNumber != null;

  int? get age {
    if (birthDate == null) return null;
    final now = DateTime.now();
    int age = now.year - birthDate!.year;
    if (now.month < birthDate!.month ||
        (now.month == birthDate!.month && now.day < birthDate!.day)) {
      age--;
    }
    return age;
  }

  factory MemberModel.fromJson(Map<String, dynamic> json) =>
      _$MemberModelFromJson(json);

  Map<String, dynamic> toJson() => _$MemberModelToJson(this);

  MemberModel copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
    DateTime? birthDate,
    Gender? gender,
    String? address,
    String? city,
    String? state,
    String? zipCode,
    String? country,
    MemberStatus? status,
    MemberType? type,
    String? organizationId,
    List<String>? tags,
    Map<String, dynamic>? customFields,
    CareProfile? careProfile,
    List<String>? familyMemberIds,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? notes,
    String? photoUrl,
  }) {
    return MemberModel(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      birthDate: birthDate ?? this.birthDate,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      zipCode: zipCode ?? this.zipCode,
      country: country ?? this.country,
      status: status ?? this.status,
      type: type ?? this.type,
      organizationId: organizationId ?? this.organizationId,
      tags: tags ?? this.tags,
      customFields: customFields ?? this.customFields,
      careProfile: careProfile ?? this.careProfile,
      familyMemberIds: familyMemberIds ?? this.familyMemberIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      notes: notes ?? this.notes,
      photoUrl: photoUrl ?? this.photoUrl,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MemberModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'MemberModel{id: $id, name: $fullName, status: $status}';
}

/// Care Profile for tracking spiritual, physical, and moral well-being
@JsonSerializable()
class CareProfile {
  final SpiritualStatus spiritualStatus;
  final HealthStatus physicalStatus;
  final String? spiritualNotes;
  final String? physicalNotes;
  final String? moralNotes;
  final DateTime? lastContactDate;
  final String? lastContactBy;
  final CareUrgency urgency;
  final List<String> prayerRequests;
  final Map<String, dynamic>? customCareFields;

  const CareProfile({
    this.spiritualStatus = SpiritualStatus.unknown,
    this.physicalStatus = HealthStatus.unknown,
    this.spiritualNotes,
    this.physicalNotes,
    this.moralNotes,
    this.lastContactDate,
    this.lastContactBy,
    this.urgency = CareUrgency.normal,
    this.prayerRequests = const [],
    this.customCareFields,
  });

  factory CareProfile.fromJson(Map<String, dynamic> json) =>
      _$CareProfileFromJson(json);

  Map<String, dynamic> toJson() => _$CareProfileToJson(this);

  CareProfile copyWith({
    SpiritualStatus? spiritualStatus,
    HealthStatus? physicalStatus,
    String? spiritualNotes,
    String? physicalNotes,
    String? moralNotes,
    DateTime? lastContactDate,
    String? lastContactBy,
    CareUrgency? urgency,
    List<String>? prayerRequests,
    Map<String, dynamic>? customCareFields,
  }) {
    return CareProfile(
      spiritualStatus: spiritualStatus ?? this.spiritualStatus,
      physicalStatus: physicalStatus ?? this.physicalStatus,
      spiritualNotes: spiritualNotes ?? this.spiritualNotes,
      physicalNotes: physicalNotes ?? this.physicalNotes,
      moralNotes: moralNotes ?? this.moralNotes,
      lastContactDate: lastContactDate ?? this.lastContactDate,
      lastContactBy: lastContactBy ?? this.lastContactBy,
      urgency: urgency ?? this.urgency,
      prayerRequests: prayerRequests ?? this.prayerRequests,
      customCareFields: customCareFields ?? this.customCareFields,
    );
  }
}

/// Enums for Member Management
enum Gender {
  @JsonValue('male')
  male,
  @JsonValue('female')
  female,
  @JsonValue('other')
  other,
  @JsonValue('prefer_not_to_say')
  preferNotToSay;

  String get displayName {
    switch (this) {
      case Gender.male:
        return 'Male';
      case Gender.female:
        return 'Female';
      case Gender.other:
        return 'Other';
      case Gender.preferNotToSay:
        return 'Prefer not to say';
    }
  }
}

enum MemberStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('visitor')
  visitor,
  @JsonValue('new_member')
  newMember,
  @JsonValue('former_member')
  formerMember;

  String get displayName {
    switch (this) {
      case MemberStatus.active:
        return 'Active';
      case MemberStatus.inactive:
        return 'Inactive';
      case MemberStatus.visitor:
        return 'Visitor';
      case MemberStatus.newMember:
        return 'New Member';
      case MemberStatus.formerMember:
        return 'Former Member';
    }
  }
}

enum MemberType {
  @JsonValue('member')
  member,
  @JsonValue('leader')
  leader,
  @JsonValue('volunteer')
  volunteer,
  @JsonValue('staff')
  staff,
  @JsonValue('visitor')
  visitor;

  String get displayName {
    switch (this) {
      case MemberType.member:
        return 'Member';
      case MemberType.leader:
        return 'Leader';
      case MemberType.volunteer:
        return 'Volunteer';
      case MemberType.staff:
        return 'Staff';
      case MemberType.visitor:
        return 'Visitor';
    }
  }
}

enum SpiritualStatus {
  @JsonValue('thriving')
  thriving,
  @JsonValue('growing')
  growing,
  @JsonValue('stable')
  stable,
  @JsonValue('struggling')
  struggling,
  @JsonValue('crisis')
  crisis,
  @JsonValue('unknown')
  unknown;

  String get displayName {
    switch (this) {
      case SpiritualStatus.thriving:
        return 'Thriving';
      case SpiritualStatus.growing:
        return 'Growing';
      case SpiritualStatus.stable:
        return 'Stable';
      case SpiritualStatus.struggling:
        return 'Struggling';
      case SpiritualStatus.crisis:
        return 'Crisis';
      case SpiritualStatus.unknown:
        return 'Unknown';
    }
  }
}

enum HealthStatus {
  @JsonValue('excellent')
  excellent,
  @JsonValue('good')
  good,
  @JsonValue('fair')
  fair,
  @JsonValue('poor')
  poor,
  @JsonValue('critical')
  critical,
  @JsonValue('unknown')
  unknown;

  String get displayName {
    switch (this) {
      case HealthStatus.excellent:
        return 'Excellent';
      case HealthStatus.good:
        return 'Good';
      case HealthStatus.fair:
        return 'Fair';
      case HealthStatus.poor:
        return 'Poor';
      case HealthStatus.critical:
        return 'Critical';
      case HealthStatus.unknown:
        return 'Unknown';
    }
  }
}

enum CareUrgency {
  @JsonValue('low')
  low,
  @JsonValue('normal')
  normal,
  @JsonValue('high')
  high,
  @JsonValue('urgent')
  urgent;

  String get displayName {
    switch (this) {
      case CareUrgency.low:
        return 'Low Priority';
      case CareUrgency.normal:
        return 'Normal Priority';
      case CareUrgency.high:
        return 'High Priority';
      case CareUrgency.urgent:
        return 'Urgent';
    }
  }
}
