import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { Controller, Control, FieldError } from "react-hook-form";

interface InputFieldProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  error?: FieldError | string;
  rules?: object;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  error,
  rules,
  containerStyle,
  labelStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  ...textInputProps
}) => {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          inputStyle,
          errorMessage && styles.errorBorder,
          multiline && styles.multilineContainer,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={
                [
                  styles.input,
                  leftIcon ? styles.inputWithLeftIcon : undefined,
                  rightIcon ? styles.inputWithRightIcon : undefined,
                  multiline ? styles.multilineInput : undefined,
                ].filter(Boolean) as any
              }
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : 1}
              textAlignVertical={multiline ? "top" : "center"}
              {...textInputProps}
            />
          )}
        />

        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  multilineContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
    minHeight: 80,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    paddingVertical: 0,
  },
  multilineInput: {
    textAlignVertical: "top",
    paddingTop: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorBorder: {
    borderColor: "#DC2626",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginTop: 4,
  },
});

export default InputField;
