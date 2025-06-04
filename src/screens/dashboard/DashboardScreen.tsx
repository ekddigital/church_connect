import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  DashboardStats,
  WelfareRequest,
  WelfareCategory,
  UrgencyLevel,
  RequestType,
  RequestStatus,
} from "../../types";
import { StatCard, RecentRequests } from "../../components/dashboard";
import { LoadingSpinner } from "../../components/common";
import { LineChartComponent } from "../../components/charts";

const DashboardScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<WelfareRequest[]>([]);

  // Mock data for demonstration
  const mockStats: DashboardStats = {
    totalMembers: 245,
    pendingRequests: 12,
    approvedRequests: 8,
    totalAmountDisbursed: 15750,
    monthlyRequests: 23,
    unreadMessages: 5,
  };

  const mockRecentRequests: WelfareRequest[] = [
    {
      id: "1",
      userId: "user1",
      title: "Medical Emergency Support",
      description: "Need assistance with hospital bills for emergency surgery.",
      category: WelfareCategory.MEDICAL_SUPPORT,
      urgencyLevel: UrgencyLevel.HIGH,
      requestType: RequestType.EMERGENCY,
      amountRequested: 2500,
      status: RequestStatus.PENDING,
      priority: 1,
      followUpRequired: false,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      userId: "user2",
      title: "Education Fee Support",
      description: "Assistance needed for child school fees.",
      category: WelfareCategory.EDUCATION_SUPPORT,
      urgencyLevel: UrgencyLevel.MEDIUM,
      requestType: RequestType.ONE_TIME,
      amountRequested: 800,
      status: RequestStatus.UNDER_REVIEW,
      priority: 3,
      followUpRequired: false,
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-14"),
    },
  ];

  const monthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [12, 19, 15, 23, 18, 25],
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setStats(mockStats);
        setRecentRequests(mockRecentRequests);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleRequestPress = (request: WelfareRequest) => {
    // Navigate to request details
    console.log("Request pressed:", request.id);
  };

  const handleViewAllRequests = () => {
    // Navigate to welfare screen
    console.log("View all requests");
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}
          </Text>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Members"
                value={stats.totalMembers}
                icon="people-outline"
                color="#4F46E5"
              />
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                icon="hourglass-outline"
                color="#F59E0B"
                trend={{ value: 12, isPositive: false }}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Approved This Month"
                value={stats.approvedRequests}
                icon="checkmark-circle-outline"
                color="#10B981"
                trend={{ value: 25, isPositive: true }}
              />
              <StatCard
                title="Amount Disbursed"
                value={`$${stats.totalAmountDisbursed.toLocaleString()}`}
                icon="cash-outline"
                color="#059669"
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Monthly Requests"
                value={stats.monthlyRequests}
                icon="document-text-outline"
                color="#8B5CF6"
              />
              <StatCard
                title="Unread Messages"
                value={stats.unreadMessages}
                icon="mail-unread-outline"
                color="#EF4444"
              />
            </View>
          </View>
        )}

        <LineChartComponent
          title="Monthly Welfare Requests"
          data={monthlyData}
        />

        <RecentRequests
          requests={recentRequests}
          onRequestPress={handleRequestPress}
          onViewAll={handleViewAllRequests}
        />
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
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
});

export default DashboardScreen;
