// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'member_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MemberModel _$MemberModelFromJson(Map<String, dynamic> json) => MemberModel(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      birthDate: json['birthDate'] == null
          ? null
          : DateTime.parse(json['birthDate'] as String),
      gender: $enumDecodeNullable(_$GenderEnumMap, json['gender']),
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      zipCode: json['zipCode'] as String?,
      country: json['country'] as String?,
      status: $enumDecodeNullable(_$MemberStatusEnumMap, json['status']) ??
          MemberStatus.active,
      type: $enumDecodeNullable(_$MemberTypeEnumMap, json['type']) ??
          MemberType.member,
      organizationId: json['organizationId'] as String,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      customFields: json['customFields'] as Map<String, dynamic>?,
      careProfile:
          CareProfile.fromJson(json['careProfile'] as Map<String, dynamic>),
      familyMemberIds: (json['familyMemberIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      notes: json['notes'] as String?,
      photoUrl: json['photoUrl'] as String?,
    );

Map<String, dynamic> _$MemberModelToJson(MemberModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'phoneNumber': instance.phoneNumber,
      'birthDate': instance.birthDate?.toIso8601String(),
      'gender': _$GenderEnumMap[instance.gender],
      'address': instance.address,
      'city': instance.city,
      'state': instance.state,
      'zipCode': instance.zipCode,
      'country': instance.country,
      'status': _$MemberStatusEnumMap[instance.status]!,
      'type': _$MemberTypeEnumMap[instance.type]!,
      'organizationId': instance.organizationId,
      'tags': instance.tags,
      'customFields': instance.customFields,
      'careProfile': instance.careProfile,
      'familyMemberIds': instance.familyMemberIds,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'notes': instance.notes,
      'photoUrl': instance.photoUrl,
    };

const _$GenderEnumMap = {
  Gender.male: 'male',
  Gender.female: 'female',
  Gender.other: 'other',
  Gender.preferNotToSay: 'prefer_not_to_say',
};

const _$MemberStatusEnumMap = {
  MemberStatus.active: 'active',
  MemberStatus.inactive: 'inactive',
  MemberStatus.visitor: 'visitor',
  MemberStatus.newMember: 'new_member',
  MemberStatus.formerMember: 'former_member',
};

const _$MemberTypeEnumMap = {
  MemberType.member: 'member',
  MemberType.leader: 'leader',
  MemberType.volunteer: 'volunteer',
  MemberType.staff: 'staff',
  MemberType.visitor: 'visitor',
};

CareProfile _$CareProfileFromJson(Map<String, dynamic> json) => CareProfile(
      spiritualStatus: $enumDecodeNullable(
              _$SpiritualStatusEnumMap, json['spiritualStatus']) ??
          SpiritualStatus.unknown,
      physicalStatus:
          $enumDecodeNullable(_$HealthStatusEnumMap, json['physicalStatus']) ??
              HealthStatus.unknown,
      spiritualNotes: json['spiritualNotes'] as String?,
      physicalNotes: json['physicalNotes'] as String?,
      moralNotes: json['moralNotes'] as String?,
      lastContactDate: json['lastContactDate'] == null
          ? null
          : DateTime.parse(json['lastContactDate'] as String),
      lastContactBy: json['lastContactBy'] as String?,
      urgency: $enumDecodeNullable(_$CareUrgencyEnumMap, json['urgency']) ??
          CareUrgency.normal,
      prayerRequests: (json['prayerRequests'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      customCareFields: json['customCareFields'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$CareProfileToJson(CareProfile instance) =>
    <String, dynamic>{
      'spiritualStatus': _$SpiritualStatusEnumMap[instance.spiritualStatus]!,
      'physicalStatus': _$HealthStatusEnumMap[instance.physicalStatus]!,
      'spiritualNotes': instance.spiritualNotes,
      'physicalNotes': instance.physicalNotes,
      'moralNotes': instance.moralNotes,
      'lastContactDate': instance.lastContactDate?.toIso8601String(),
      'lastContactBy': instance.lastContactBy,
      'urgency': _$CareUrgencyEnumMap[instance.urgency]!,
      'prayerRequests': instance.prayerRequests,
      'customCareFields': instance.customCareFields,
    };

const _$SpiritualStatusEnumMap = {
  SpiritualStatus.thriving: 'thriving',
  SpiritualStatus.growing: 'growing',
  SpiritualStatus.stable: 'stable',
  SpiritualStatus.struggling: 'struggling',
  SpiritualStatus.crisis: 'crisis',
  SpiritualStatus.unknown: 'unknown',
};

const _$HealthStatusEnumMap = {
  HealthStatus.excellent: 'excellent',
  HealthStatus.good: 'good',
  HealthStatus.fair: 'fair',
  HealthStatus.poor: 'poor',
  HealthStatus.critical: 'critical',
  HealthStatus.unknown: 'unknown',
};

const _$CareUrgencyEnumMap = {
  CareUrgency.low: 'low',
  CareUrgency.normal: 'normal',
  CareUrgency.high: 'high',
  CareUrgency.urgent: 'urgent',
};
