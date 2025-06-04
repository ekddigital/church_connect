import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import WelfareScreen from "../screens/welfare/WelfareScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ReportsScreen from "../screens/reports/ReportsScreen";
import CreateWelfareRequestScreen from "../screens/welfare/CreateWelfareRequestScreen";
import WelfareRequestDetailScreen from "../screens/welfare/WelfareRequestDetailScreen";
import MessageDetailScreen from "../screens/messages/MessageDetailScreen";
import ComposeMessageScreen from "../screens/messages/ComposeMessageScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import MemberProfilingScreen from "../screens/members/MemberProfilingScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import FileUploadScreen from "../screens/admin/FileUploadScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import { BottomTabParamList } from "../types";

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Welfare":
              iconName = focused ? "heart" : "heart-outline";
              break;
            case "Messages":
              iconName = focused ? "mail" : "mail-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            case "Reports":
              iconName = focused ? "analytics" : "analytics-outline";
              break;
            default:
              iconName = "home-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Welfare" component={WelfareScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateWelfareRequest"
        component={CreateWelfareRequestScreen}
        options={{ title: "Create Welfare Request" }}
      />
      <Stack.Screen
        name="WelfareRequest"
        component={WelfareRequestDetailScreen}
        options={{ title: "Welfare Request Details" }}
      />
      <Stack.Screen
        name="MessageDetail"
        component={MessageDetailScreen}
        options={{ title: "Message Details" }}
      />
      <Stack.Screen
        name="ComposeMessage"
        component={ComposeMessageScreen}
        options={{ title: "Compose Message" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="MemberProfiling"
        component={MemberProfilingScreen}
        options={{ title: "Member Profiling" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="FileUpload"
        component={FileUploadScreen}
        options={{ title: "File Upload" }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: "User Management" }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
