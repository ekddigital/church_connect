import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  WelfareRequestFilters,
  WelfareCategory,
  RequestStatus,
  UrgencyLevel,
} from "../../types";
import { Card, Button } from "../common";

interface WelfareFilterModalProps {
  filters: WelfareRequestFilters;
  onFiltersChange: (filters: WelfareRequestFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const WelfareFilterModal: React.FC<WelfareFilterModalProps> = ({
  filters,
  onFiltersChange,
  onClose,
  onApply,
  onClear,
}) => {
  const [localFilters, setLocalFilters] =
    useState<WelfareRequestFilters>(filters);

  const statusOptions = Object.values(RequestStatus);
  const categoryOptions = Object.values(WelfareCategory);
  const urgencyOptions = Object.values(UrgencyLevel);

  const toggleFilter = <T extends string>(
    filterKey: keyof WelfareRequestFilters,
    value: T
  ) => {
    const currentValues = (localFilters[filterKey] as T[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setLocalFilters({
      ...localFilters,
      [filterKey]: newValues,
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleClear = () => {
    const clearedFilters: WelfareRequestFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClear();
  };

  const FilterSection: React.FC<{
    title: string;
    options: string[];
    selectedValues: string[];
    onToggle: (value: string) => void;
  }> = ({ title, options, selectedValues, onToggle }) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              selectedValues.includes(option) && styles.selectedOption,
            ]}
            onPress={() => onToggle(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValues.includes(option) && styles.selectedOptionText,
              ]}
            >
              {option.replace(/_/g, " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Requests</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <FilterSection
          title="Status"
          options={statusOptions}
          selectedValues={localFilters.status || []}
          onToggle={(value) => toggleFilter("status", value as RequestStatus)}
        />

        <FilterSection
          title="Category"
          options={categoryOptions}
          selectedValues={localFilters.category || []}
          onToggle={(value) =>
            toggleFilter("category", value as WelfareCategory)
          }
        />

        <FilterSection
          title="Urgency Level"
          options={urgencyOptions}
          selectedValues={localFilters.urgencyLevel || []}
          onToggle={(value) =>
            toggleFilter("urgencyLevel", value as UrgencyLevel)
          }
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Clear All"
          variant="outline"
          onPress={handleClear}
          style={styles.clearButton}
        />
        <Button
          title="Apply Filters"
          onPress={handleApply}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  optionText: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default WelfareFilterModal;
