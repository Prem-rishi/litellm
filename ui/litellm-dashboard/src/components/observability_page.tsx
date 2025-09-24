import React from "react";
import { Title, Text } from "@tremor/react";
import MetricsTable from "@/components/MetricsTable";

const ObservabilityPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Title>Observability Platform</Title>
        <Text className="mt-2">
          POST data to /api/observability/logs to store, GET to retrieve, and visualize in real-time dashboard below
        </Text>
      </div>
      <MetricsTable />
    </div>
  );
};

export default ObservabilityPage;