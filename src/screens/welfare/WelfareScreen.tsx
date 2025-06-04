import React, { useState, useEffect } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  WelfareRequest,
  WelfareRequestFilters,
  WelfareCategory,
  UrgencyLevel,
  RequestType,
  RequestStatus,
  RootStackParamList,
} from "../../types";
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
import Modal from "react-native-modal";
import {
  WelfareRequestCard,
  WelfareFilterModal,
} from "../../components/welfare";
import { LoadingSpinner, EmptyState, Button } from "../../components/common";

const WelfareScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<WelfareRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WelfareRequest[]>(
    []
  );
  const [filters, setFilters] = useState<WelfareRequestFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Mock data
  const mockRequests: WelfareRequest[] = [
    {
      id: "1",
      userId: "user1",
      title: "Medical Emergency Support",
      description:
        "Need assistance with hospital bills for emergency surgery. The patient requires immediate financial support for medical expenses.",
      category: WelfareCategory.MEDICAL_SUPPORT,
      urgencyLevel: UrgencyLevel.CRITICAL,
      requestType: RequestType.EMERGENCY,
      amountRequested: 2500,
      status: RequestStatus.PENDING,
      priority: 1,
      followUpRequired: true,
      followUpDate: new Date("2024-01-20"),
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      userId: "user2",
      title: "Education Fee Support",
      description:
        "Assistance needed for child school fees for the upcoming semester.",
      category: WelfareCategory.EDUCATION_SUPPORT,
      urgencyLevel: UrgencyLevel.MEDIUM,
      requestType: RequestType.ONE_TIME,
      amountRequested: 800,
      status: RequestStatus.UNDER_REVIEW,
      priority: 3,
      followUpRequired: false,
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-16"),
    },
    {
      id: "3",
      userId: "user3",
      title: "Housing Assistance",
      description: "Need help with rent payment due to temporary job loss.",
      category: WelfareCategory.HOUSING_ASSISTANCE,
      urgencyLevel: UrgencyLevel.HIGH,
      requestType: RequestType.ONE_TIME,
      amountRequested: 1200,
      status: RequestStatus.APPROVED,
      priority: 2,
      followUpRequired: false,
      approvedBy: "admin1",
      approvedAt: new Date("2024-01-16"),
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-16"),
    },
    {
      id: "4",
      userId: "user4",
      title: "Food Assistance",
      description:
        "Family struggling with food security due to financial constraints.",
      category: WelfareCategory.FOOD_ASSISTANCE,
      urgencyLevel: UrgencyLevel.MEDIUM,
      requestType: RequestType.RECURRING,
      amountRequested: 300,
      status: RequestStatus.COMPLETED,
      priority: 4,
      followUpRequired: false,
      fulfilledBy: "admin1",
      fulfilledAt: new Date("2024-01-10"),
      actualAmount: 300,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-10"),
    },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadRequests = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setRequests(mockRequests);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load welfare requests");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((request) =>
        filters.status!.includes(request.status)
      );
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((request) =>
        filters.category!.includes(request.category)
      );
    }

    if (filters.urgencyLevel && filters.urgencyLevel.length > 0) {
      filtered = filtered.filter((request) =>
        filters.urgencyLevel!.includes(request.urgencyLevel)
      );
    }

    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(
        (request) =>
          request.amountRequested &&
          request.amountRequested >= filters.amountMin!
      );
    }

    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(
        (request) =>
          request.amountRequested &&
          request.amountRequested <= filters.amountMax!
      );
    }

    setFilteredRequests(filtered);
  };

  const handleRequestPress = (request: WelfareRequest) => {
    navigation.navigate("WelfareRequest", { requestId: request.id });
  };

  const handleCreateRequest = () => {
    navigation.navigate("CreateWelfareRequest");
  };

  const handleFiltersChange = (newFilters: WelfareRequestFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilterModal(false);
  };

  const renderRequestItem = ({ item }: { item: WelfareRequest }) => (
    <WelfareRequestCard request={item} onPress={handleRequestPress} />
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.urgencyLevel && filters.urgencyLevel.length > 0) count++;
    if (filters.amountMin !== undefined || filters.amountMax !== undefined)
      count++;
    return count;
  };

  if (loading) {
    return <LoadingSpinner text="Loading welfare requests..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welfare Requests</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              getActiveFiltersCount() > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter-outline" size={20} color="#4F46E5" />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Button
            title="New Request"
            onPress={handleCreateRequest}
            size="small"
            icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No welfare requests found"
            description="No requests match your current filters or there are no requests available."
            actionTitle="Create New Request"
            onAction={handleCreateRequest}
          />
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        isVisible={showFilterModal}
        onBackdropPress={() => setShowFilterModal(false)}
        style={styles.modal}
      >
        <WelfareFilterModal
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </Modal>
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
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: "#EEF2FF",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
});

export default WelfareScreen;
