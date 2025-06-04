import React, { useState, useEffect } from "react";
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
  MessageForm,
  MessagePriority,
  MessageType,
  User,
  UserRole,
  MembershipLevel,
  AccountStatus,
  Gender,
  MaritalStatus,
} from "../../types";
import {
  Button,
  InputField,
  Card,
  LoadingSpinner,
} from "../../components/common";
import { useAuthContext } from "../../contexts/AuthContext";

const schema: yup.ObjectSchema<MessageForm> = yup.object().shape({
  receiverId: yup.string().required("Recipient is required"),
  subject: yup.string().optional(),
  content: yup
    .string()
    .required("Message content is required")
    .min(10, "Message must be at least 10 characters"),
  priority: yup.mixed<MessagePriority>().required("Priority is required"),
});

const ComposeMessageScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<User[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MessageForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      receiverId: "",
      subject: "",
      content: "",
      priority: MessagePriority.NORMAL,
    },
  });

  // Mock recipients data
  const mockRecipients: User[] = [
    {
      id: "admin1",
      email: "admin@churchconnect.org",
      firstName: "John",
      lastName: "Admin",
      phone: "+1234567890",
      role: UserRole.ADMIN,
      membershipLevel: MembershipLevel.ELDER,
      accountStatus: AccountStatus.ACTIVE,
      gender: Gender.MALE,
      maritalStatus: MaritalStatus.MARRIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "pastor1",
      email: "pastor@churchconnect.org",
      firstName: "Pastor",
      lastName: "Johnson",
      phone: "+1234567891",
      role: UserRole.PASTOR,
      membershipLevel: MembershipLevel.PASTOR,
      accountStatus: AccountStatus.ACTIVE,
      gender: Gender.MALE,
      maritalStatus: MaritalStatus.MARRIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "welfare1",
      email: "welfare@churchconnect.org",
      firstName: "Mary",
      lastName: "Smith",
      phone: "+1234567892",
      role: UserRole.WELFARE_OFFICER,
      membershipLevel: MembershipLevel.LEADER,
      accountStatus: AccountStatus.ACTIVE,
      gender: Gender.FEMALE,
      maritalStatus: MaritalStatus.SINGLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      // TODO: Implement actual API call to get available recipients
      // const users = await userService.getAvailableRecipients();

      // Simulate API call
      setTimeout(() => {
        setRecipients(mockRecipients);
        setLoadingRecipients(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load recipients");
      setLoadingRecipients(false);
    }
  };

  const onSubmit = async (data: MessageForm) => {
    setLoading(true);
    try {
      // TODO: Implement message sending service
      console.log("Sending message:", {
        ...data,
        senderId: user?.id,
        messageType: MessageType.PERSONAL,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Message Sent", "Your message has been sent successfully.", [
        {
          text: "OK",
          onPress: () => {
            /* Navigate back */
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const getRecipientDisplayName = (recipient: User) => {
    const roleDisplay = recipient.role.replace("_", " ").toLowerCase();
    return `${recipient.firstName} ${recipient.lastName} (${roleDisplay})`;
  };

  if (loadingRecipients) {
    return <LoadingSpinner text="Loading recipients..." />;
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
            <Text style={styles.title}>Compose Message</Text>
            <Text style={styles.subtitle}>
              Send a message to church administrators or officers
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>To *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("receiverId")}
                    onValueChange={(value) => setValue("receiverId", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select recipient..." value="" />
                    {recipients.map((recipient) => (
                      <Picker.Item
                        key={recipient.id}
                        label={getRecipientDisplayName(recipient)}
                        value={recipient.id}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.receiverId && (
                  <Text style={styles.errorText}>
                    {errors.receiverId.message}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("priority")}
                    onValueChange={(value) =>
                      setValue("priority", value as MessagePriority)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Low" value={MessagePriority.LOW} />
                    <Picker.Item
                      label="Normal"
                      value={MessagePriority.NORMAL}
                    />
                    <Picker.Item label="High" value={MessagePriority.HIGH} />
                    <Picker.Item
                      label="Urgent"
                      value={MessagePriority.URGENT}
                    />
                  </Picker>
                </View>
              </View>

              <InputField
                name="subject"
                control={control}
                label="Subject"
                placeholder="Enter message subject (optional)"
                error={errors.subject}
              />

              <InputField
                name="content"
                control={control}
                label="Message *"
                placeholder="Type your message here..."
                error={errors.content}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                style={styles.messageInput}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Button
              title="Send Message"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.sendButton}
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
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  messageInput: {
    minHeight: 120,
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  sendButton: {
    marginBottom: 8,
  },
  draftButton: {
    marginBottom: 20,
  },
});

export default ComposeMessageScreen;
