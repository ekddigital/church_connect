import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { User, UserRole, AccountStatus, RootStackParamList } from "../../types";
import {
  Card,
  Button,
  StatusBadge,
  LoadingSpinner,
} from "../../components/common";
import { useAuthContext } from "../../contexts/AuthContext";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleMemberProfiling = () => {
    navigation.navigate("MemberProfiling", { userId: user?.id });
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh user profile data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.WELFARE_OFFICER:
        return "Welfare Officer";
      case UserRole.PASTOR:
        return "Pastor";
      case UserRole.ELDER:
        return "Elder";
      case UserRole.DEACON:
        return "Deacon";
      case UserRole.MEMBER:
        return "Member";
      default:
        return role;
    }
  };

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "danger";
      case UserRole.WELFARE_OFFICER:
      case UserRole.PASTOR:
        return "warning";
      case UserRole.ELDER:
      case UserRole.DEACON:
        return "info";
      case UserRole.MEMBER:
        return "success";
      default:
        return "default";
    }
  };

  const formatJoinDate = (date: Date | undefined) => {
    if (!date) return "Not specified";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const profileMenuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: handleEditProfile,
      showChevron: true,
    },
    {
      icon: "clipboard-outline",
      title: "Member Profiling",
      subtitle: "Complete your member profile",
      onPress: handleMemberProfiling,
      showChevron: true,
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "App preferences and privacy",
      onPress: handleSettings,
      showChevron: true,
    },
  ];

  // Add admin-only menu items
  if (user?.role === UserRole.ADMIN) {
    profileMenuItems.push({
      icon: "people-outline",
      title: "User Management",
      subtitle: "Manage church members",
      onPress: () => navigation.navigate("UserManagement" as never),
      showChevron: true,
    });
  }

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#6B7280" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>

              <View style={styles.roleContainer}>
                <StatusBadge
                  status={getRoleDisplayName(user?.role || UserRole.MEMBER)}
                  variant={getRoleVariant(user?.role || UserRole.MEMBER)}
                />
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone Number:</Text>
              <Text style={styles.detailValue}>
                {user?.phone || "Not provided"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date Joined:</Text>
              <Text style={styles.detailValue}>
                {formatJoinDate(user?.createdAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      user?.accountStatus === AccountStatus.ACTIVE
                        ? "#059669"
                        : "#DC2626",
                  },
                ]}
              >
                {user?.accountStatus === AccountStatus.ACTIVE
                  ? "Active"
                  : "Inactive"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#4F46E5" />
                </View>

                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>

                {item.showChevron && (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Information */}
        <Card style={styles.appInfoCard}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Version:</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>

          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>Build:</Text>
            <Text style={styles.appInfoValue}>2024.01.001</Text>
          </View>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

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
  profileCard: {
    margin: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: "flex-start",
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  appInfoCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  appInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  appInfoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    borderColor: "#EF4444",
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
