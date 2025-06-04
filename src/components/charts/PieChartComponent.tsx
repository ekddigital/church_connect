import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Card } from "../common";

interface PieChartComponentProps {
  title?: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
  }>;
  showLegend?: boolean;
}

const screenWidth = Dimensions.get("window").width;

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  title,
  data,
  showLegend = true,
}) => {
  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const enhancedData = data.map((item) => ({
    ...item,
    population: item.value, // Map value to population for react-native-chart-kit
    legendFontColor: item.legendFontColor || "#333",
    legendFontSize: item.legendFontSize || 12,
  }));

  return (
    <Card title={title}>
      <View style={styles.container}>
        <PieChart
          data={enhancedData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          hasLegend={showLegend}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});

export default PieChartComponent;
