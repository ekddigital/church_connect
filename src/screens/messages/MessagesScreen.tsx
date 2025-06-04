import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { Message, MessagePriority, MessageType } from "../../types";
import { LoadingSpinner, EmptyState, Button } from "../../components/common";
import { MessageCard } from "../../components/messages";
import { useAuthContext } from "../../contexts/AuthContext";

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "sent">("all");

  // Mock data for demonstration
  const mockMessages: Message[] = [
    {
      id: "1",
      senderId: "admin1",
      receiverId: user?.id || "user1",
      subject: "Welfare Request Update",
      content:
        "Your welfare request for medical assistance has been approved. Please contact the welfare office to proceed with the next steps.",
      messageType: MessageType.WELFARE_UPDATE,
      priority: MessagePriority.HIGH,
      isRead: false,
      createdAt: new Date("2024-01-16T10:30:00"),
      updatedAt: new Date("2024-01-16T10:30:00"),
    },
    {
      id: "2",
      senderId: "admin1",
      receiverId: user?.id || "user1",
      subject: "Church Announcement",
      content:
        "Join us for our special prayer service this Sunday at 6 PM. We will be praying for all members who have submitted welfare requests.",
      messageType: MessageType.ANNOUNCEMENT,
      priority: MessagePriority.NORMAL,
      isRead: true,
      createdAt: new Date("2024-01-15T14:20:00"),
      updatedAt: new Date("2024-01-15T14:20:00"),
    },
    {
      id: "3",
      senderId: user?.id || "user1",
      receiverId: "admin1",
      subject: "Thank You",
      content:
        "Thank you for approving my welfare request. Your support means a lot to my family during this difficult time.",
      messageType: MessageType.PERSONAL,
      priority: MessagePriority.NORMAL,
      isRead: true,
      createdAt: new Date("2024-01-14T16:45:00"),
      updatedAt: new Date("2024-01-14T16:45:00"),
    },
    {
      id: "4",
      senderId: "admin1",
      receiverId: user?.id || "user1",
      subject: "System Notification",
      content:
        "Your profile information has been updated successfully. If you did not make this change, please contact the administrator immediately.",
      messageType: MessageType.SYSTEM_NOTIFICATION,
      priority: MessagePriority.URGENT,
      isRead: false,
      createdAt: new Date("2024-01-13T09:15:00"),
      updatedAt: new Date("2024-01-13T09:15:00"),
    },
  ];

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    try {
      // TODO: Implement actual API call
      // const messages = await messageService.getMessages(user?.id, filter);

      // Simulate API call
      setTimeout(() => {
        let filteredMessages = mockMessages;

        if (filter === "unread") {
          filteredMessages = mockMessages.filter(
            (msg) => !msg.isRead && msg.receiverId === user?.id
          );
        } else if (filter === "sent") {
          filteredMessages = mockMessages.filter(
            (msg) => msg.senderId === user?.id
          );
        }

        setMessages(filteredMessages);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load messages");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleMessagePress = async (message: Message) => {
    // Mark as read if it's an unread received message
    if (!message.isRead && message.receiverId === user?.id) {
      try {
        // TODO: Implement mark as read
        // await messageService.markAsRead(message.id);

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, isRead: true } : msg
          )
        );
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }

    // Navigate to message detail
    navigation.navigate("MessageDetail", { messageId: message.id });
  };

  const handleComposeMessage = () => {
    navigation.navigate("ComposeMessage" as never);
  };

  const renderFilterButton = (
    filterType: "all" | "unread" | "sent",
    title: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === filterType && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageCard
      message={item}
      onPress={handleMessagePress}
      currentUserId={user?.id || ""}
    />
  );

  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.isRead && msg.receiverId === user?.id)
      .length;
  };

  if (loading) {
    return <LoadingSpinner text="Loading messages..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          {getUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{getUnreadCount()}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.composeButton}
          onPress={handleComposeMessage}
        >
          <Ionicons name="create-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("unread", "Unread")}
        {renderFilterButton("sent", "Sent")}
      </View>

      {/* Messages List */}
      {messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="mail-outline"
            title={
              filter === "unread"
                ? "No Unread Messages"
                : filter === "sent"
                ? "No Sent Messages"
                : "No Messages"
            }
            description={
              filter === "unread"
                ? "You have no unread messages at the moment."
                : filter === "sent"
                ? "You haven't sent any messages yet."
                : "You have no messages yet. Start a conversation!"
            }
            actionTitle="Compose Message"
            onAction={handleComposeMessage}
          />
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleComposeMessage}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  composeButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  activeFilterButton: {
    backgroundColor: "#4F46E5",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 80, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MessagesScreen;
