import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";
import {
  User,
  Gender,
  MaritalStatus,
  EmploymentStatus,
  MembershipLevel,
} from "../../types";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface MemberProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation: string;
  employmentStatus: EmploymentStatus;
  membershipLevel: MembershipLevel;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalInformation?: string;
  specialNeeds?: string;
}

const schema: yup.ObjectSchema<MemberProfileFormData> = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.string().required("Address is required"),
  dateOfBirth: yup.date().required("Date of birth is required"),
  gender: yup
    .mixed<Gender>()
    .oneOf(Object.values(Gender))
    .required("Gender is required"),
  maritalStatus: yup
    .mixed<MaritalStatus>()
    .oneOf(Object.values(MaritalStatus))
    .required("Marital status is required"),
  occupation: yup.string().required("Occupation is required"),
  employmentStatus: yup
    .mixed<EmploymentStatus>()
    .oneOf(Object.values(EmploymentStatus))
    .required("Employment status is required"),
  membershipLevel: yup
    .mixed<MembershipLevel>()
    .oneOf(Object.values(MembershipLevel))
    .required("Membership level is required"),
  emergencyContactName: yup
    .string()
    .required("Emergency contact name is required"),
  emergencyContactPhone: yup
    .string()
    .required("Emergency contact phone is required"),
  medicalInformation: yup.string().optional(),
  specialNeeds: yup.string().optional(),
});

interface MemberProfilingScreenProps {
  route?: {
    params?: {
      userId?: string;
      isEditMode?: boolean;
    };
  };
  navigation: any;
}

export const MemberProfilingScreen: React.FC<MemberProfilingScreenProps> = ({
  route,
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [memberData, setMemberData] = useState<User | null>(null);

  const isEditMode = route?.params?.isEditMode || false;
  const userId = route?.params?.userId;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: new Date(),
      gender: Gender.MALE,
      maritalStatus: MaritalStatus.SINGLE,
      occupation: "",
      employmentStatus: EmploymentStatus.EMPLOYED,
      membershipLevel: MembershipLevel.REGULAR,
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalInformation: "",
      specialNeeds: "",
    },
  });

  const watchedDateOfBirth = watch("dateOfBirth");

  useEffect(() => {
    if (isEditMode && userId) {
      loadMemberData();
    }
  }, [isEditMode, userId]);

  const loadMemberData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual service call
      // const data = await memberService.getMemberProfile(userId);
      // setMemberData(data);
      // populateForm(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load member data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MemberProfileFormData) => {
    setLoading(true);
    try {
      if (isEditMode) {
        // TODO: Replace with actual service call
        // await memberService.updateMemberProfile(userId, data);
        Alert.alert("Success", "Member profile updated successfully");
      } else {
        // TODO: Replace with actual service call
        // await memberService.createMemberProfile(data);
        Alert.alert("Success", "Member profile created successfully");
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save member profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>
          {isEditMode ? "Edit Member Profile" : "New Member Profile"}
        </Text>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <InputField
          name="firstName"
          control={control}
          label="First Name"
          rules={{ required: "First name is required" }}
        />

        <InputField
          name="lastName"
          control={control}
          label="Last Name"
          rules={{ required: "Last name is required" }}
        />

        <InputField
          name="email"
          control={control}
          label="Email"
          keyboardType="email-address"
          rules={{ required: "Email is required" }}
        />

        <InputField
          name="phone"
          control={control}
          label="Phone Number"
          keyboardType="phone-pad"
          rules={{ required: "Phone number is required" }}
        />

        <InputField
          name="address"
          control={control}
          label="Address"
          multiline
          numberOfLines={3}
          rules={{ required: "Address is required" }}
        />

        {/* Date of Birth */}
        <Text style={styles.label}>Date of Birth *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {watchedDateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={showDatePicker}
          date={watchedDateOfBirth}
          mode="date"
          onConfirm={(date) => {
            setShowDatePicker(false);
            setValue("dateOfBirth", date);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Gender */}
        <Text style={styles.label}>Gender *</Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                {Object.values(Gender).map((gender) => (
                  <Picker.Item key={gender} label={gender} value={gender} />
                ))}
              </Picker>
            </View>
          )}
        />

        {/* Marital Status */}
        <Text style={styles.label}>Marital Status *</Text>
        <Controller
          control={control}
          name="maritalStatus"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                {Object.values(MaritalStatus).map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>
          )}
        />

        {/* Professional Information */}
        <Text style={styles.sectionTitle}>Professional Information</Text>

        <InputField
          name="occupation"
          control={control}
          label="Occupation"
          rules={{ required: "Occupation is required" }}
        />

        <Text style={styles.label}>Employment Status *</Text>
        <Controller
          control={control}
          name="employmentStatus"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                {Object.values(EmploymentStatus).map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>
          )}
        />

        {/* Church Information */}
        <Text style={styles.sectionTitle}>Church Information</Text>

        <Text style={styles.label}>Membership Level *</Text>
        <Controller
          control={control}
          name="membershipLevel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                {Object.values(MembershipLevel).map((level) => (
                  <Picker.Item key={level} label={level} value={level} />
                ))}
              </Picker>
            </View>
          )}
        />

        {/* Emergency Contact */}
        <Text style={styles.sectionTitle}>Emergency Contact</Text>

        <InputField
          name="emergencyContactName"
          control={control}
          label="Emergency Contact Name"
          rules={{ required: "Emergency contact name is required" }}
        />

        <InputField
          name="emergencyContactPhone"
          control={control}
          label="Emergency Contact Phone"
          keyboardType="phone-pad"
          rules={{ required: "Emergency contact phone is required" }}
        />

        {/* Additional Information */}
        <Text style={styles.sectionTitle}>Additional Information</Text>

        <InputField
          name="medicalInformation"
          control={control}
          label="Medical Information"
          multiline
          numberOfLines={3}
          placeholder="Any medical conditions, allergies, or medications..."
        />

        <InputField
          name="specialNeeds"
          control={control}
          label="Special Needs"
          multiline
          numberOfLines={3}
          placeholder="Any special accommodations or assistance needed..."
        />

        <Button
          title={isEditMode ? "Update Profile" : "Create Profile"}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "white",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default MemberProfilingScreen;
