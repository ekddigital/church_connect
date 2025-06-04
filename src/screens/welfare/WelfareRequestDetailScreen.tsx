import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  WelfareRequest,
  UserRole,
  RootStackParamList,
  WelfareCategory,
  UrgencyLevel,
  RequestType,
  RequestStatus,
} from "../../types";
import {
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
} from "../../components/common";
import { useAuthContext } from "../../contexts/AuthContext";

type WelfareRequestDetailRouteProp = RouteProp<
  RootStackParamList,
  "WelfareRequest"
>;

const WelfareRequestDetailScreen: React.FC = () => {
  const { user } = useAuthContext();
  const route = useRoute<WelfareRequestDetailRouteProp>();
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<WelfareRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data for demonstration
  const mockRequest: WelfareRequest = {
    id: requestId || "1",
    userId: "user1",
    title: "Medical Emergency Support",
    description:
      "I am reaching out to request financial assistance for an urgent medical emergency. My mother was recently diagnosed with a serious condition that requires immediate surgery. The medical bills are overwhelming, and despite having some insurance coverage, there is still a significant amount that we need to cover out of pocket.\n\nThe total cost of the surgery and related treatments is estimated at $5,000. We have been able to gather $2,500 through family contributions, but we still need $2,500 to proceed with the treatment.\n\nThis is a time-sensitive matter as the doctors have advised that the surgery should be performed within the next two weeks to ensure the best possible outcome.",
    category: WelfareCategory.MEDICAL_SUPPORT,
    urgencyLevel: UrgencyLevel.HIGH,
    requestType: RequestType.EMERGENCY,
    amountRequested: 2500,
    currentSituation:
      "My mother needs urgent surgery and we have already exhausted our immediate financial resources. The hospital requires payment before proceeding with the surgery.",
    expectedOutcome:
      "With this assistance, we will be able to proceed with the surgery immediately and ensure my mother receives the medical care she desperately needs.",
    status: RequestStatus.PENDING,
    priority: 1,
    followUpRequired: false,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    documents: ["medical_report.pdf", "cost_estimate.pdf"],
  };

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      // TODO: Implement actual API call
      // const request = await welfareService.getRequestById(requestId);

      // Simulate API call
      setTimeout(() => {
        setRequest(mockRequest);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load request details");
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;

    setActionLoading(true);
    try {
      // TODO: Implement approval logic
      console.log("Approving request:", request.id);

      Alert.alert(
        "Request Approved",
        "The welfare request has been approved successfully.",
        [{ text: "OK" }]
      );

      // Update local state
      setRequest({ ...request, status: RequestStatus.APPROVED });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;

    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this request? Please provide a reason.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              // TODO: Show reason input and implement rejection logic
              console.log("Rejecting request:", request.id);

              Alert.alert(
                "Request Rejected",
                "The welfare request has been rejected."
              );
              setRequest({ ...request, status: RequestStatus.REJECTED });
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to reject request");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMarkCompleted = async () => {
    if (!request) return;

    setActionLoading(true);
    try {
      // TODO: Implement completion logic
      console.log("Marking request as completed:", request.id);

      Alert.alert(
        "Request Completed",
        "The welfare request has been marked as completed."
      );
      setRequest({ ...request, status: RequestStatus.COMPLETED });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };

  const openDocument = async (documentName: string) => {
    try {
      // TODO: Implement document opening logic
      Alert.alert("Document", `Opening ${documentName}`);
    } catch (error) {
      Alert.alert("Error", "Failed to open document");
    }
  };

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

  const canTakeAction =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.WELFARE_OFFICER ||
    user?.role === UserRole.PASTOR;

  const isOwner = user?.id === request?.userId;

  if (loading) {
    return <LoadingSpinner text="Loading request details..." />;
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Request not found</Text>
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
            <View style={styles.titleContainer}>
              <Ionicons
                name={getCategoryIcon(request.category)}
                size={24}
                color="#4F46E5"
              />
              <Text style={styles.title}>{request.title}</Text>
            </View>
            <StatusBadge
              status={request.status.replace("_", " ")}
              variant={getStatusVariant(request.status)}
            />
          </View>

          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Category:</Text>
              <Text style={styles.metadataValue}>
                {request.category.replace(/_/g, " ")}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Urgency:</Text>
              <Text
                style={[
                  styles.metadataValue,
                  { color: getUrgencyColor(request.urgencyLevel) },
                ]}
              >
                {request.urgencyLevel}
              </Text>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Type:</Text>
              <Text style={styles.metadataValue}>
                {request.requestType.replace(/_/g, " ")}
              </Text>
            </View>

            {request.amountRequested && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Amount:</Text>
                <Text style={[styles.metadataValue, styles.amount]}>
                  ${request.amountRequested.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Submitted:</Text>
              <Text style={styles.metadataValue}>
                {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </Card>

        {/* Current Situation */}
        {request.currentSituation && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Current Situation</Text>
            <Text style={styles.description}>{request.currentSituation}</Text>
          </Card>
        )}

        {/* Expected Outcome */}
        {request.expectedOutcome && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Expected Outcome</Text>
            <Text style={styles.description}>{request.expectedOutcome}</Text>
          </Card>
        )}

        {/* Documents */}
        {request.documents && request.documents.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {request.documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentItem}
                onPress={() => openDocument(doc)}
              >
                <Ionicons name="document-outline" size={20} color="#4F46E5" />
                <Text style={styles.documentName}>{doc}</Text>
                <Ionicons name="download-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        {canTakeAction && request.status === "PENDING" && (
          <Card style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                title="Approve"
                onPress={handleApprove}
                loading={actionLoading}
                style={styles.approveButton}
              />
              <Button
                title="Reject"
                variant="outline"
                onPress={handleReject}
                loading={actionLoading}
                style={styles.rejectButton}
              />
            </View>
          </Card>
        )}

        {canTakeAction && request.status === RequestStatus.APPROVED && (
          <Card style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Mark as Completed</Text>
            <Button
              title="Mark Completed"
              onPress={handleMarkCompleted}
              loading={actionLoading}
            />
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
    flex: 1,
  },
  metadata: {
    gap: 8,
  },
  metadataItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metadataLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  metadataValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  amount: {
    color: "#059669",
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
  },
  actionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default WelfareRequestDetailScreen;
