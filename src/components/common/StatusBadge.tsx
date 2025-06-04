import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "default",
  size = "medium",
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "#DCFCE7",
          color: "#166534",
        };
      case "warning":
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        };
      case "danger":
        return {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
        };
      case "info":
        return {
          backgroundColor: "#DBEAFE",
          color: "#1E40AF",
        };
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#374151",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: 8,
          paddingVertical: 2,
          fontSize: 12,
        };
      case "large":
        return {
          paddingHorizontal: 16,
          paddingVertical: 6,
          fontSize: 16,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 4,
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantStyles.backgroundColor },
        {
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyles.color, fontSize: sizeStyles.fontSize },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
});

export default StatusBadge;
