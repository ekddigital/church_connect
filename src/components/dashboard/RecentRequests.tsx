import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WelfareRequest } from "../../types";
import { Card, StatusBadge } from "../common";

interface RecentRequestsProps {
  requests: WelfareRequest[];
  onRequestPress: (request: WelfareRequest) => void;
  onViewAll: () => void;
}

const RecentRequests: React.FC<RecentRequestsProps> = ({
  requests,
  onRequestPress,
  onViewAll,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "success";
      case "REJECTED":
      case "CANCELLED":
        return "danger";
      case "PENDING":
      case "UNDER_REVIEW":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "FINANCIAL_ASSISTANCE":
        return "cash-outline";
      case "MEDICAL_SUPPORT":
        return "medical-outline";
      case "EDUCATION_SUPPORT":
        return "school-outline";
      case "HOUSING_ASSISTANCE":
        return "home-outline";
      case "FOOD_ASSISTANCE":
        return "restaurant-outline";
      case "EMPLOYMENT_SUPPORT":
        return "briefcase-outline";
      case "COUNSELING":
        return "chatbubbles-outline";
      case "EMERGENCY_RELIEF":
        return "warning-outline";
      default:
        return "help-circle-outline";
    }
  };

  const renderRequestItem = ({ item }: { item: WelfareRequest }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => onRequestPress(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.requestTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <StatusBadge
          status={item.status.replace("_", " ")}
          variant={getStatusVariant(item.status)}
          size="small"
        />
      </View>

      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.requestFooter}>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.amountRequested && (
          <Text style={styles.requestAmount}>
            ${item.amountRequested.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const HeaderComponent = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Recent Requests</Text>
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All</Text>
        <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Card style={styles.card}>
      {HeaderComponent}
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No recent requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests.slice(0, 5)} // Show only first 5
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  requestDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  requestAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
});

export default RecentRequests;
