import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Card } from "../common";

interface BarChartComponentProps {
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  color?: string;
  showValues?: boolean;
}

const screenWidth = Dimensions.get("window").width;

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  title,
  data,
  color = "#4F46E5",
  showValues = true,
}) => {
  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: color,
    },
    propsForLabels: {
      fontSize: 12,
    },
    barPercentage: 0.7,
    fillShadowGradient: color,
    fillShadowGradientOpacity: 1,
  };

  return (
    <Card title={title}>
      <View style={styles.container}>
        <BarChart
          data={data}
          width={screenWidth - 64} // Account for card padding
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={showValues}
          fromZero
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default BarChartComponent;
