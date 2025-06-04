import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { User, UserRole, MembershipLevel, AccountStatus } from "../../types";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";

interface UserManagementScreenProps {
  navigation: any;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  navigation,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "ALL">(
    "ALL"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Mock users data
  const mockUsers: User[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      role: UserRole.ADMIN,
      membershipLevel: MembershipLevel.LEADER,
      accountStatus: AccountStatus.ACTIVE,
      profileImage: "",
      address: "123 Main St",
      dateOfBirth: new Date("1980-01-15"),
      gender: "Male" as any,
      maritalStatus: "Married" as any,
      occupation: "Pastor",
      emergencyContact: {
        name: "Jane Doe",
        phone: "+1234567891",
        relationship: "Spouse",
      },
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@example.com",
      phone: "+1234567892",
      role: UserRole.WELFARE_OFFICER,
      membershipLevel: MembershipLevel.REGULAR,
      accountStatus: AccountStatus.ACTIVE,
      profileImage: "",
      address: "456 Oak Ave",
      dateOfBirth: new Date("1985-03-20"),
      gender: "Female" as any,
      maritalStatus: "Single" as any,
      occupation: "Teacher",
      emergencyContact: {
        name: "Robert Smith",
        phone: "+1234567893",
        relationship: "Father",
      },
      createdAt: new Date("2023-02-01"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "3",
      firstName: "David",
      lastName: "Johnson",
      email: "david.johnson@example.com",
      phone: "+1234567894",
      role: UserRole.MEMBER,
      membershipLevel: MembershipLevel.REGULAR,
      accountStatus: AccountStatus.INACTIVE,
      profileImage: "",
      address: "789 Pine St",
      dateOfBirth: new Date("1990-07-10"),
      gender: "Male" as any,
      maritalStatus: "Single" as any,
      occupation: "Engineer",
      emergencyContact: {
        name: "Sarah Johnson",
        phone: "+1234567895",
        relationship: "Sister",
      },
      createdAt: new Date("2023-03-01"),
      updatedAt: new Date("2023-12-01"),
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual service call
      // const userData = await userService.getAllUsers();
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || user.accountStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (user: User, action: string) => {
    switch (action) {
      case "view":
        navigation.navigate("UserDetail", { userId: user.id });
        break;
      case "edit":
        navigation.navigate("MemberProfiling", {
          userId: user.id,
          isEditMode: true,
        });
        break;
      case "activate":
        toggleUserStatus(user, AccountStatus.ACTIVE);
        break;
      case "deactivate":
        toggleUserStatus(user, AccountStatus.INACTIVE);
        break;
      case "suspend":
        toggleUserStatus(user, AccountStatus.SUSPENDED);
        break;
      case "delete":
        confirmDeleteUser(user);
        break;
      case "reset_password":
        resetUserPassword(user);
        break;
      case "change_role":
        showRoleChangeDialog(user);
        break;
    }
  };

  const toggleUserStatus = async (user: User, newStatus: AccountStatus) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${newStatus.toLowerCase()} ${user.firstName} ${
        user.lastName
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // TODO: Replace with actual service call
              // await userService.updateUserStatus(user.id, newStatus);
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === user.id ? { ...u, accountStatus: newStatus } : u
                )
              );
              Alert.alert("Success", `User status updated to ${newStatus}`);
            } catch (error) {
              Alert.alert("Error", "Failed to update user status");
            }
          },
        },
      ]
    );
  };

  const confirmDeleteUser = (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Replace with actual service call
              // await userService.deleteUser(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const resetUserPassword = async (user: User) => {
    Alert.alert(
      "Reset Password",
      `Send password reset email to ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              // TODO: Replace with actual service call
              // await authService.resetPassword(user.email);
              Alert.alert("Success", "Password reset email sent");
            } catch (error) {
              Alert.alert("Error", "Failed to send reset email");
            }
          },
        },
      ]
    );
  };

  const showRoleChangeDialog = (user: User) => {
    // TODO: Implement role change modal
    Alert.alert("Change Role", "Role change dialog not implemented yet");
  };

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return "#34C759";
      case AccountStatus.INACTIVE:
        return "#FF9500";
      case AccountStatus.SUSPENDED:
        return "#FF3B30";
      case AccountStatus.PENDING:
        return "#007AFF";
      default:
        return "#999";
    }
  };

  const renderUserActions = (user: User) => {
    const actions = [
      { id: "view", title: "View", icon: "eye-outline" },
      { id: "edit", title: "Edit", icon: "create-outline" },
      { id: "reset_password", title: "Reset Password", icon: "key-outline" },
      { id: "change_role", title: "Change Role", icon: "person-outline" },
    ];

    if (user.accountStatus === AccountStatus.ACTIVE) {
      actions.push(
        { id: "deactivate", title: "Deactivate", icon: "pause-outline" },
        { id: "suspend", title: "Suspend", icon: "ban-outline" }
      );
    } else {
      actions.push({ id: "activate", title: "Activate", icon: "play-outline" });
    }

    actions.push({ id: "delete", title: "Delete", icon: "trash-outline" });

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.actionsContainer}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              action.id === "delete" && styles.deleteAction,
            ]}
            onPress={() => handleUserAction(user, action.id)}
          >
            <Ionicons
              name={action.icon as any}
              size={16}
              color={action.id === "delete" ? "#FF3B30" : "#007AFF"}
            />
            <Text
              style={[
                styles.actionText,
                action.id === "delete" && styles.deleteActionText,
              ]}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderUserItem = ({ item: user }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}
              {user.lastName[0]}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        </View>
        <StatusBadge status={user.accountStatus} />
      </View>

      <View style={styles.userMeta}>
        <Text style={styles.metaText}>
          Member Level: {user.membershipLevel}
        </Text>
        <Text style={styles.metaText}>
          Joined: {user.createdAt.toLocaleDateString()}
        </Text>
      </View>

      {renderUserActions(user)}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>User Management</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Role:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={roleFilter}
                onValueChange={setRoleFilter}
                style={styles.picker}
              >
                <Picker.Item label="All Roles" value="ALL" />
                {Object.values(UserRole).map((role) => (
                  <Picker.Item key={role} label={role} value={role} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={setStatusFilter}
                style={styles.picker}
              >
                <Picker.Item label="All Status" value="ALL" />
                {Object.values(AccountStatus).map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <Button
          title="Add New User"
          onPress={() => navigation.navigate("MemberProfiling")}
          style={styles.addButton}
        />
      </Card>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Users Found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={refreshUsers}
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filtersCard: {
    margin: 16,
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    height: 40,
  },
  addButton: {
    marginTop: 8,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deleteAction: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
  },
  actionText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  deleteActionText: {
    color: "#FF3B30",
  },
});

export default UserManagementScreen;
