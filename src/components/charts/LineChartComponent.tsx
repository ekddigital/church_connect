import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card } from "../common";

interface LineChartComponentProps {
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  color?: string;
  bezier?: boolean;
}

const screenWidth = Dimensions.get("window").width;

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  title,
  data,
  color = "#4F46E5",
  bezier = true,
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
      r: "4",
      strokeWidth: "2",
      stroke: color,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  return (
    <Card title={title}>
      <View style={styles.container}>
        <LineChart
          data={data}
          width={screenWidth - 64} // Account for card padding
          height={220}
          chartConfig={chartConfig}
          bezier={bezier}
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
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

export default LineChartComponent;
