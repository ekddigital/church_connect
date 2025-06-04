import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "../../types";
import { Card, StatusBadge } from "../common";

interface MessageCardProps {
  message: Message;
  onPress: (message: Message) => void;
  currentUserId: string;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onPress,
  currentUserId,
}) => {
  const isReceived = message.receiverId === currentUserId;
  const isUnread = !message.isRead && isReceived;

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
      default:
        return "mail-outline";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], {
        weekday: "short",
      });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(message)}>
      <Card
        style={StyleSheet.flatten([styles.card, isUnread && styles.unreadCard])}
      >
        <View style={styles.header}>
          <View style={styles.messageInfo}>
            <Ionicons
              name={getMessageTypeIcon(message.messageType)}
              size={20}
              color={isUnread ? "#4F46E5" : "#6B7280"}
            />
            <View style={styles.messageDetails}>
              <Text style={[styles.sender, isUnread && styles.unreadText]}>
                {isReceived ? "From Admin" : "To Member"}
              </Text>
              <Text style={styles.timestamp}>
                {formatDate(message.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.badges}>
            {message.priority !== "NORMAL" && (
              <StatusBadge
                status={message.priority}
                variant={getPriorityVariant(message.priority)}
                size="small"
                style={styles.priorityBadge}
              />
            )}
            {isUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>

        {message.subject && (
          <Text
            style={[styles.subject, isUnread && styles.unreadText]}
            numberOfLines={1}
          >
            {message.subject}
          </Text>
        )}

        <Text style={styles.content} numberOfLines={2}>
          {message.content}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.messageType}>
            {message.messageType.replace(/_/g, " ")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isUnread ? "#4F46E5" : "#9CA3AF"}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  sender: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityBadge: {
    marginLeft: 8,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  messageType: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  unreadText: {
    color: "#4F46E5",
    fontWeight: "700",
  },
});

export default MessageCard;
