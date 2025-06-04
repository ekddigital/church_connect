import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Message,
  MessageType,
  MessagePriority,
  RootStackParamList,
} from "../../types";
import {
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
} from "../../components/common";
import { useAuthContext } from "../../contexts/AuthContext";

type MessageDetailRouteProp = RouteProp<RootStackParamList, "MessageDetail">;

const MessageDetailScreen: React.FC = () => {
  const { user } = useAuthContext();
  const route = useRoute<MessageDetailRouteProp>();
  const { messageId } = route.params;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);

  // Mock data for demonstration
  const mockMessage: Message = {
    id: messageId,
    senderId: "admin1",
    receiverId: user?.id || "user1",
    subject: "Welfare Request Update - Medical Assistance Approved",
    content: `Dear ${user?.firstName} ${user?.lastName},

We are pleased to inform you that your welfare request for medical assistance has been approved by the church welfare committee.

Details of your request:
- Request ID: WR-2024-001
- Category: Medical Support
- Amount Approved: $2,500
- Date Approved: January 16, 2024

Next Steps:
1. Please visit the church office during working hours (Monday-Friday, 9 AM - 5 PM) to complete the necessary paperwork.
2. Bring the following documents:
   - Valid ID
   - Medical bills and receipts
   - Bank account details for direct transfer

The approved amount will be transferred to your account within 3-5 business days after completing the paperwork.

We are praying for your mother's quick recovery and want you to know that our church family is here to support you during this difficult time.

If you have any questions or need assistance, please don't hesitate to contact us at:
- Phone: (555) 123-4567
- Email: welfare@churchconnect.org

May God bless you and your family.

In His service,
Pastor Johnson
Church Welfare Committee`,
    messageType: MessageType.WELFARE_UPDATE,
    priority: MessagePriority.HIGH,
    isRead: false,
    createdAt: new Date("2024-01-16T10:30:00"),
    updatedAt: new Date("2024-01-16T10:30:00"),
  };

  useEffect(() => {
    loadMessageDetails();
  }, [messageId]);

  const loadMessageDetails = async () => {
    try {
      // TODO: Implement actual API call
      // const message = await messageService.getMessageById(messageId);

      // Simulate API call
      setTimeout(() => {
        setMessage(mockMessage);
        setLoading(false);

        // Mark as read if it's an unread received message
        if (!mockMessage.isRead && mockMessage.receiverId === user?.id) {
          markAsRead();
        }
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load message details");
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      // TODO: Implement mark as read API call
      // await messageService.markAsRead(messageId);
      console.log("Message marked as read:", messageId);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleReply = () => {
    if (!message) return;

    // Navigate to compose message with reply data
    // navigation.navigate('ComposeMessage', {
    //   recipientId: message.senderId,
    //   subject: message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`,
    //   originalMessage: message,
    // });
    Alert.alert("Reply", "Reply functionality will be implemented");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement delete message API call
              // await messageService.deleteMessage(messageId);
              Alert.alert(
                "Message Deleted",
                "The message has been deleted successfully."
              );
              // navigation.goBack();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete message");
            }
          },
        },
      ]
    );
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "danger";
      case "HIGH":
        return "warning";
      case "NORMAL":
        return "info";
      case "LOW":
        return "default";
      default:
        return "default";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return "megaphone-outline";
      case "WELFARE_UPDATE":
        return "heart-outline";
      case "SYSTEM_NOTIFICATION":
        return "notifications-outline";
      case "PERSONAL":
        return "person-outline";
      default:
        return "mail-outline";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const isReceived = message?.receiverId === user?.id;

  if (loading) {
    return <LoadingSpinner text="Loading message..." />;
  }

  if (!message) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Message not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.messageInfo}>
              <Ionicons
                name={getMessageTypeIcon(message.messageType)}
                size={24}
                color="#4F46E5"
              />
              <View style={styles.messageDetails}>
                <Text style={styles.messageType}>
                  {message.messageType.replace(/_/g, " ")}
                </Text>
                <Text style={styles.timestamp}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            </View>

            {message.priority !== MessagePriority.NORMAL && (
              <StatusBadge
                status={message.priority}
                variant={getPriorityVariant(message.priority)}
                size="small"
              />
            )}
          </View>

          <View style={styles.participants}>
            <View style={styles.participantRow}>
              <Text style={styles.participantLabel}>From:</Text>
              <Text style={styles.participantValue}>
                {isReceived ? "Church Admin" : "You"}
              </Text>
            </View>
            <View style={styles.participantRow}>
              <Text style={styles.participantLabel}>To:</Text>
              <Text style={styles.participantValue}>
                {isReceived ? "You" : "Church Admin"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Subject */}
        {message.subject && (
          <Card style={styles.subjectCard}>
            <Text style={styles.subjectLabel}>Subject</Text>
            <Text style={styles.subject}>{message.subject}</Text>
          </Card>
        )}

        {/* Content */}
        <Card style={styles.contentCard}>
          <Text style={styles.contentLabel}>Message</Text>
          <Text style={styles.content}>{message.content}</Text>
        </Card>

        {/* Action Buttons */}
        {isReceived && (
          <Card style={styles.actionCard}>
            <View style={styles.actionButtons}>
              <Button
                title="Reply"
                onPress={handleReply}
                style={styles.replyButton}
              />
              <Button
                title="Delete"
                variant="outline"
                onPress={handleDelete}
                style={styles.deleteButton}
              />
            </View>
          </Card>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  headerCard: {
    margin: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  messageDetails: {
    marginLeft: 12,
    flex: 1,
  },
  messageType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textTransform: "capitalize",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  participants: {
    gap: 8,
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  participantValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  subjectCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  subjectLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  subject: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 24,
  },
  contentCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  actionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  replyButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default MessageDetailScreen;
