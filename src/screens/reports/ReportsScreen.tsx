import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import BarChartComponent from "../../components/charts/BarChartComponent";
import PieChartComponent from "../../components/charts/PieChartComponent";
import LineChartComponent from "../../components/charts/LineChartComponent";
import { WelfareRequest, User } from "../../types";

interface ReportData {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalAmount: number;
  averageAmount: number;
  requestsByCategory: { [key: string]: number };
  requestsByMonth: { [key: string]: number };
  topApplicants: { name: string; count: number }[];
}

const ReportsScreen: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual service call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockData: ReportData = {
        totalRequests: 156,
        approvedRequests: 98,
        pendingRequests: 34,
        rejectedRequests: 24,
        totalAmount: 485000,
        averageAmount: 3109,
        requestsByCategory: {
          Medical: 45,
          Educational: 32,
          Emergency: 28,
          Housing: 25,
          Food: 18,
          Other: 8,
        },
        requestsByMonth: {
          Jan: 12,
          Feb: 18,
          Mar: 22,
          Apr: 28,
          May: 31,
          Jun: 25,
          Jul: 20,
        },
        topApplicants: [
          { name: "John Doe", count: 3 },
          { name: "Jane Smith", count: 2 },
          { name: "Mike Johnson", count: 2 },
          { name: "Sarah Wilson", count: 2 },
          { name: "David Brown", count: 1 },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  };

  const exportReport = () => {
    Alert.alert("Export Report", "Choose export format:", [
      { text: "PDF", onPress: () => handleExport("pdf") },
      { text: "Excel", onPress: () => handleExport("excel") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleExport = (format: string) => {
    Alert.alert("Export", `Report will be exported as ${format.toUpperCase()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  if (loading && !reportData) {
    return <LoadingSpinner overlay />;
  }

  if (!reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>Failed to load report data</Text>
          <Button title="Retry" onPress={fetchReportData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welfare Reports</Text>
          <TouchableOpacity onPress={exportReport} style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Period Selection */}
        <View style={styles.periodContainer}>
          {(["month", "quarter", "year"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {reportData.totalRequests}
              </Text>
              <Text style={styles.summaryLabel}>Total Requests</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#4CAF50" }]}>
                {reportData.approvedRequests}
              </Text>
              <Text style={styles.summaryLabel}>Approved</Text>
            </Card>
          </View>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#FF9800" }]}>
                {reportData.pendingRequests}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#f44336" }]}>
                {reportData.rejectedRequests}
              </Text>
              <Text style={styles.summaryLabel}>Rejected</Text>
            </Card>
          </View>
        </View>

        {/* Financial Summary */}
        <Card style={styles.financialCard}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Amount:</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(reportData.totalAmount)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Average per Request:</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(reportData.averageAmount)}
            </Text>
          </View>
        </Card>

        {/* Requests by Category Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Requests by Category</Text>
          <PieChartComponent
            title="Requests by Category"
            data={Object.entries(reportData.requestsByCategory).map(
              ([key, value]) => ({
                name: key,
                value,
                color: getCategoryColor(key),
              })
            )}
          />
        </Card>

        {/* Monthly Trend Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          <LineChartComponent
            title="Monthly Trend"
            data={{
              labels: Object.keys(reportData.requestsByMonth),
              datasets: [
                {
                  data: Object.values(reportData.requestsByMonth),
                  strokeWidth: 2,
                },
              ],
            }}
          />
        </Card>

        {/* Category Breakdown Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          <BarChartComponent
            title="Category Breakdown"
            data={{
              labels: Object.keys(reportData.requestsByCategory),
              datasets: [
                {
                  data: Object.values(reportData.requestsByCategory),
                },
              ],
            }}
          />
        </Card>

        {/* Top Applicants */}
        <Card style={styles.topApplicantsCard}>
          <Text style={styles.cardTitle}>Top Applicants</Text>
          {reportData.topApplicants.map((applicant, index) => (
            <View key={index} style={styles.applicantRow}>
              <View style={styles.applicantRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.applicantName}>{applicant.name}</Text>
              <Text style={styles.applicantCount}>
                {applicant.count} requests
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    Medical: "#ff6b6b",
    Educational: "#4ecdc4",
    Emergency: "#45b7d1",
    Housing: "#96ceb4",
    Food: "#feca57",
    Other: "#ff9ff3",
  };
  return colors[category] || "#95a5a6";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  exportButton: {
    padding: 8,
  },
  periodContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#007AFF",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 20,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  financialCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: "#666",
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  topApplicantsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 16,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  applicantRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  applicantName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  applicantCount: {
    fontSize: 12,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 16,
  },
});

export default ReportsScreen;
