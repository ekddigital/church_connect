import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Picker } from "@react-native-picker/picker";
import { useAuthContext } from "../../contexts/AuthContext";
import { User } from "../../types";

interface EditProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  occupation: string;
}

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.string().required("Address is required"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  emergencyContactName: yup
    .string()
    .required("Emergency contact name is required"),
  emergencyContactPhone: yup
    .string()
    .required("Emergency contact phone is required"),
  occupation: yup.string().required("Occupation is required"),
});

const EditProfileScreen: React.FC = () => {
  const { user, updateUserProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      occupation: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("address", user.address || "");
      setValue(
        "dateOfBirth",
        user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : ""
      );
      setValue("emergencyContactName", user.emergencyContact?.name || "");
      setValue("emergencyContactPhone", user.emergencyContact?.phone || "");
      setValue("occupation", user.occupation || "");
      setProfileImage(user.profileImage || undefined);
    }
  }, [user, setValue]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to update your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Update Profile Picture", "Choose an option:", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser: Partial<User> = {
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: user.emergencyContact?.relationship || "Unknown",
        },
        occupation: data.occupation,
        profileImage,
        role: user.role,
        membershipLevel: user.membershipLevel,
        accountStatus: user.accountStatus,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      };

      await updateUserProfile(updatedUser as User);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            onPress={showImagePicker}
            style={styles.imageWrapper}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={50} color="#ccc" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change profile picture</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InputField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
          />

          <InputField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
          />

          <InputField
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            control={control}
            name="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            error={errors.phone?.message}
            keyboardType="phone-pad"
          />

          <InputField
            control={control}
            name="dateOfBirth"
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            error={errors.dateOfBirth?.message}
          />

          <InputField
            control={control}
            name="address"
            label="Address"
            placeholder="Enter your address"
            error={errors.address?.message}
            multiline
            numberOfLines={3}
          />

          {/* Work Information */}
          <Text style={styles.sectionTitle}>Work Information</Text>

          <InputField
            control={control}
            name="occupation"
            label="Occupation"
            placeholder="Enter your occupation"
            error={errors.occupation?.message}
          />

          {/* Emergency Contact */}
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <InputField
            control={control}
            name="emergencyContactName"
            label="Emergency Contact Name"
            placeholder="Enter emergency contact name"
            error={errors.emergencyContactName?.message}
          />

          <InputField
            control={control}
            name="emergencyContactPhone"
            label="Emergency Contact Phone"
            placeholder="Enter emergency contact phone"
            error={errors.emergencyContactPhone?.message}
            keyboardType="phone-pad"
          />

          <Button
            title="Update Profile"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.updateButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  imageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  imageHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
  updateButton: {
    marginTop: 24,
    marginBottom: 20,
  },
});

export default EditProfileScreen;
