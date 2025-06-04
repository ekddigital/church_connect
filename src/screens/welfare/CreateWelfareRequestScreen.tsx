import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Picker } from "@react-native-picker/picker";
import {
  WelfareRequestForm,
  WelfareCategory,
  UrgencyLevel,
  RequestType,
} from "../../types";
import {
  Button,
  InputField,
  Card,
  LoadingSpinner,
} from "../../components/common";
import { useAuthContext } from "../../contexts/AuthContext";

const schema: yup.ObjectSchema<WelfareRequestForm> = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(20, "Description must be at least 20 characters"),
  category: yup.mixed<WelfareCategory>().required("Category is required"),
  urgencyLevel: yup.mixed<UrgencyLevel>().required("Urgency level is required"),
  requestType: yup.mixed<RequestType>().required("Request type is required"),
  amountRequested: yup.number().optional(),
  currentSituation: yup.string().optional(),
  expectedOutcome: yup.string().optional(),
});

const CreateWelfareRequestScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WelfareRequestForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: WelfareCategory.FINANCIAL_ASSISTANCE,
      urgencyLevel: UrgencyLevel.MEDIUM,
      requestType: RequestType.ONE_TIME,
      amountRequested: undefined,
      currentSituation: "",
      expectedOutcome: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: WelfareRequestForm) => {
    setLoading(true);
    try {
      // TODO: Implement welfare request creation service
      console.log("Creating welfare request:", { ...data, userId: user?.id });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Request Submitted",
        "Your welfare request has been submitted successfully. You will be notified once it is reviewed.",
        [
          {
            text: "OK",
            onPress: () => {
              /* Navigate back */
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const requiresAmount =
    selectedCategory === WelfareCategory.FINANCIAL_ASSISTANCE ||
    selectedCategory === WelfareCategory.MEDICAL_SUPPORT ||
    selectedCategory === WelfareCategory.EDUCATION_SUPPORT;

  if (loading) {
    return <LoadingSpinner text="Submitting request..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Welfare Request</Text>
            <Text style={styles.subtitle}>
              Please provide detailed information about your request
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              <InputField
                name="title"
                control={control}
                label="Request Title *"
                placeholder="Brief title describing your request"
                error={errors.title}
                multiline={false}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("category")}
                    onValueChange={(value) =>
                      setValue("category", value as WelfareCategory)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="Financial Assistance"
                      value={WelfareCategory.FINANCIAL_ASSISTANCE}
                    />
                    <Picker.Item
                      label="Medical Support"
                      value={WelfareCategory.MEDICAL_SUPPORT}
                    />
                    <Picker.Item
                      label="Education Support"
                      value={WelfareCategory.EDUCATION_SUPPORT}
                    />
                    <Picker.Item
                      label="Housing Assistance"
                      value={WelfareCategory.HOUSING_ASSISTANCE}
                    />
                    <Picker.Item
                      label="Food Assistance"
                      value={WelfareCategory.FOOD_ASSISTANCE}
                    />
                    <Picker.Item
                      label="Employment Support"
                      value={WelfareCategory.EMPLOYMENT_SUPPORT}
                    />
                    <Picker.Item
                      label="Counseling"
                      value={WelfareCategory.COUNSELING}
                    />
                    <Picker.Item
                      label="Emergency Relief"
                      value={WelfareCategory.EMERGENCY_RELIEF}
                    />
                    <Picker.Item label="Other" value={WelfareCategory.OTHER} />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Urgency Level *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("urgencyLevel")}
                    onValueChange={(value) =>
                      setValue("urgencyLevel", value as UrgencyLevel)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Low" value={UrgencyLevel.LOW} />
                    <Picker.Item label="Medium" value={UrgencyLevel.MEDIUM} />
                    <Picker.Item label="High" value={UrgencyLevel.HIGH} />
                    <Picker.Item
                      label="Critical"
                      value={UrgencyLevel.CRITICAL}
                    />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Request Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("requestType")}
                    onValueChange={(value) =>
                      setValue("requestType", value as RequestType)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="One Time"
                      value={RequestType.ONE_TIME}
                    />
                    <Picker.Item
                      label="Recurring"
                      value={RequestType.RECURRING}
                    />
                    <Picker.Item
                      label="Emergency"
                      value={RequestType.EMERGENCY}
                    />
                  </Picker>
                </View>
              </View>

              {requiresAmount && (
                <InputField
                  name="amountRequested"
                  control={control}
                  label="Amount Requested ($)"
                  placeholder="Enter amount needed"
                  error={errors.amountRequested}
                  keyboardType="numeric"
                />
              )}

              <InputField
                name="description"
                control={control}
                label="Description *"
                placeholder="Provide detailed description of your request and situation"
                error={errors.description}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />

              <InputField
                name="currentSituation"
                control={control}
                label="Current Situation"
                placeholder="Describe your current circumstances"
                error={errors.currentSituation}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />

              <InputField
                name="expectedOutcome"
                control={control}
                label="Expected Outcome"
                placeholder="What do you hope to achieve with this assistance?"
                error={errors.expectedOutcome}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Button
              title="Submit Request"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.submitButton}
            />

            <Button
              title="Save as Draft"
              variant="outline"
              onPress={() => {
                /* TODO: Save as draft */
              }}
              style={styles.draftButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  picker: {
    height: 50,
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
  draftButton: {
    marginBottom: 20,
  },
});

export default CreateWelfareRequestScreen;
