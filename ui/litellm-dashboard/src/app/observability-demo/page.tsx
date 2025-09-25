import React from "react";
import { Title, Text } from "@tremor/react";
import MetricsTable from "@/components/MetricsTable";

export default function ObservabilityDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title className="text-3xl font-bold text-gray-900">
            🚀 Observability Platform Demo
          </Title>
          <Text className="mt-2 text-lg text-gray-600">
            Live demonstration of POST → GET → Dashboard visualization flow
          </Text>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-sm">
              <strong>Enhanced Flow:</strong> External API calls POST /api/observability/logs (with auth) →
              Data processed through existing spend logs & metrics endpoints →
              GET /api/observability/logs retrieves enhanced data →
              Dashboard shows comprehensive observability with spend tracking integration
            </Text>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <MetricsTable />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <Title className="text-lg font-semibold mb-4">Enhanced API Endpoints</Title>
            <div className="space-y-3">
              <div>
                <Text className="font-mono text-sm bg-gray-100 p-2 rounded">
                  POST /api/observability/logs
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Submit observability data (requires auth)</Text>
              </div>
              <div>
                <Text className="font-mono text-sm bg-gray-100 p-2 rounded">
                  GET /api/observability/logs?limit=100&type_filter=info
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Retrieve enhanced data with filters</Text>
              </div>
              <div>
                <Text className="font-mono text-sm bg-gray-100 p-2 rounded">
                  GET /api/observability/metrics
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Get comprehensive metrics</Text>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <Title className="text-lg font-semibold mb-4">Enhanced Test Commands</Title>
            <div className="space-y-4">
              <div>
                <Text className="text-xs text-gray-600 mb-2">Basic Log:</Text>
                <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                  {`curl -X POST http://localhost:8001/api/observability/logs \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"timestamp": "${new Date().toISOString()}", "type": "info", "message": "Test message", "metadata": {"key": "value"}}'`}
                </div>
              </div>
              <div>
                <Text className="text-xs text-gray-600 mb-2">With Spend Data:</Text>
                <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                  {`curl -X POST http://localhost:8001/api/observability/logs \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"timestamp": "${new Date().toISOString()}", "type": "usage", "message": "Model usage", "model": "gpt-4", "spend": 0.01, "request_id": "req_123", "metadata": {"total_tokens": 100}}'`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}