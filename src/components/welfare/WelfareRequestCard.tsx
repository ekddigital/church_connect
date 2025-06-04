import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WelfareRequest } from "../../types";
import { Card, StatusBadge } from "../common";

interface WelfareRequestCardProps {
  request: WelfareRequest;
  onPress: (request: WelfareRequest) => void;
  showDetails?: boolean;
}

const WelfareRequestCard: React.FC<WelfareRequestCardProps> = ({
  request,
  onPress,
  showDetails = true,
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "#DC2626";
      case "HIGH":
        return "#EA580C";
      case "MEDIUM":
        return "#D97706";
      case "LOW":
        return "#65A30D";
      default:
        return "#6B7280";
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

  return (
    <TouchableOpacity onPress={() => onPress(request)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name={getCategoryIcon(request.category)}
              size={20}
              color="#4F46E5"
            />
            <Text style={styles.title} numberOfLines={1}>
              {request.title}
            </Text>
          </View>
          <StatusBadge
            status={request.status.replace("_", " ")}
            variant={getStatusVariant(request.status)}
            size="small"
          />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {request.description}
        </Text>

        {showDetails && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>
                {request.category.replace(/_/g, " ")}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Urgency:</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: getUrgencyColor(request.urgencyLevel) },
                ]}
              >
                {request.urgencyLevel}
              </Text>
            </View>

            {request.amountRequested && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>
                  ${request.amountRequested.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.requestType}>
            {request.requestType.replace("_", " ")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  requestType: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "capitalize",
  },
});

export default WelfareRequestCard;
