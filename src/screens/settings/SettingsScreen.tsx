import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuthContext } from "../../contexts/AuthContext";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "toggle" | "action" | "navigation";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
}

export const SettingsScreen: React.FC = () => {
  const { logout, user } = useAuthContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This will clear all cached data. Continue?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          // TODO: Implement cache clearing
          Alert.alert("Success", "Cache cleared successfully");
        },
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This will export your personal data. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Export",
          onPress: () => {
            // TODO: Implement data export
            Alert.alert(
              "Success",
              "Data export initiated. You will receive an email with your data."
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              "Account Deletion",
              "Account deletion request submitted. Please contact support to complete the process."
            );
          },
        },
      ]
    );
  };

  const notificationSettings: SettingItem[] = [
    {
      id: "notifications",
      title: "Enable Notifications",
      subtitle: "Receive app notifications",
      type: "toggle",
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      icon: "notifications-outline",
    },
    {
      id: "email",
      title: "Email Notifications",
      subtitle: "Receive notifications via email",
      type: "toggle",
      value: emailNotifications,
      onToggle: setEmailNotifications,
      icon: "mail-outline",
    },
    {
      id: "push",
      title: "Push Notifications",
      subtitle: "Receive push notifications",
      type: "toggle",
      value: pushNotifications,
      onToggle: setPushNotifications,
      icon: "phone-portrait-outline",
    },
  ];

  const securitySettings: SettingItem[] = [
    {
      id: "biometric",
      title: "Biometric Authentication",
      subtitle: "Use fingerprint or face ID",
      type: "toggle",
      value: biometricAuth,
      onToggle: setBiometricAuth,
      icon: "finger-print-outline",
    },
    {
      id: "password",
      title: "Change Password",
      subtitle: "Update your account password",
      type: "navigation",
      onPress: () => {
        // TODO: Navigate to change password screen
        Alert.alert("Change Password", "Navigate to change password screen");
      },
      icon: "lock-closed-outline",
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: "dark_mode",
      title: "Dark Mode",
      subtitle: "Use dark theme",
      type: "toggle",
      value: darkMode,
      onToggle: setDarkMode,
      icon: "moon-outline",
    },
    {
      id: "language",
      title: "Language",
      subtitle: "App language settings",
      type: "navigation",
      onPress: () => {
        // TODO: Navigate to language settings
        Alert.alert("Language", "Navigate to language settings");
      },
      icon: "language-outline",
    },
    {
      id: "cache",
      title: "Clear Cache",
      subtitle: "Clear app cache and temporary files",
      type: "action",
      onPress: handleClearCache,
      icon: "trash-outline",
    },
  ];

  const dataSettings: SettingItem[] = [
    {
      id: "export",
      title: "Export Data",
      subtitle: "Download your personal data",
      type: "action",
      onPress: handleExportData,
      icon: "download-outline",
    },
    {
      id: "delete",
      title: "Delete Account",
      subtitle: "Permanently delete your account",
      type: "action",
      onPress: handleDeleteAccount,
      icon: "person-remove-outline",
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={
        item.type === "navigation" || item.type === "action"
          ? item.onPress
          : undefined
      }
      disabled={item.type === "toggle"}
    >
      <View style={styles.settingContent}>
        <Ionicons name={item.icon} size={24} color="#666" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={item.value ? "#f5dd4b" : "#f4f3f4"}
          />
        )}
        {(item.type === "navigation" || item.type === "action") && (
          <Ionicons name="chevron-forward-outline" size={20} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {notificationSettings.map(renderSettingItem)}
      </Card>

      {/* Security Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        {securitySettings.map(renderSettingItem)}
      </Card>

      {/* App Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        {appSettings.map(renderSettingItem)}
      </Card>

      {/* Data & Privacy */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        {dataSettings.map(renderSettingItem)}
      </Card>

      {/* Support */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => Alert.alert("Help", "Navigate to help center")}
        >
          <View style={styles.settingContent}>
            <Ionicons
              name="help-circle-outline"
              size={24}
              color="#666"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.settingTitle}>Help Center</Text>
              <Text style={styles.settingSubtitle}>Get help and support</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Alert.alert("About", "Church Welfare Management System v1.0.0")
          }
        >
          <View style={styles.settingContent}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#666"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingSubtitle}>App version and info</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Logout Button */}
      <Card style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  userCard: {
    margin: 16,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  section: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    borderColor: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});

export default SettingsScreen;
