import React from 'react';
import { Upload, Play, Pause, BarChart2, RefreshCw, AlertCircle } from 'lucide-react';
import { CustomModelManager } from '@/utils/analysis/ai/customModels';
import { Line } from 'react-chartjs-2';

interface CustomModelViewProps {
  workspaceId?: string;
}

export function CustomModelView({ workspaceId }: CustomModelViewProps) {
  const [models, setModels] = React.useState<any[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<any>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  };

  React.useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);
        const modelList = await CustomModelManager.listModels(workspaceId);
        setModels(modelList || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
        console.error('Failed to list models:', errorMessage);
        setError(errorMessage);
        setModels([]); // Set empty array as fallback
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [workspaceId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workspaceId) {
      setError('Please select a file and ensure you are in a workspace');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload model
      const { modelId, versionId } = await CustomModelManager.uploadModel(
        workspaceId,
        file,
        {
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: 'Custom model upload',
          modelType: 'custom',
          framework: 'tensorflow', // This should be determined from the file
          inputSchema: {
            type: 'object',
            properties: {
              // This should be configured by the user
              input: { type: 'array', items: { type: 'number' } }
            }
          },
          outputSchema: {
            type: 'object',
            properties: {
              // This should be configured by the user
              predictions: { type: 'array', items: { type: 'number' } }
            }
          }
        }
      );

      // Deploy model
      await CustomModelManager.deployModel(modelId, versionId, {
        computeType: 'cpu',
        memoryLimit: '2Gi'
      });

      // Refresh models list after successful upload
      const modelList = await CustomModelManager.listModels(workspaceId);
      setModels(modelList || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload model');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm relative">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold">Custom AI Models</h3>
          <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Model
            <input
              type="file"
              className="hidden"
              accept=".h5,.pb,.onnx,.pt"
              onChange={handleFileUpload}
              disabled={isUploading || !workspaceId}
            />
          </label>
        </div>
        
        {!workspaceId && (
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" />
            <p>Please select a workspace to manage custom models</p>
          </div>
        )}

        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading model...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Models List */}
      <div className="grid gap-6">
        {models.map(model => (
          <div
            key={model.id}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{model.name}</h4>
                <p className="text-sm text-gray-500">{model.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedModel(
                    selectedModel?.id === model.id ? null : model
                  )}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  {selectedModel?.id === model.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {/* Refresh metrics */}}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Model Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Framework</p>
                <p className="font-medium">{model.framework}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{model.modelType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(model.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>

            {/* Performance Metrics */}
            {selectedModel?.id === model.id && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-teal-600" />
                  <h5 className="font-medium">Performance Metrics</h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accuracy Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="text-sm font-medium text-gray-700 mb-4">Accuracy</h6>
                    <div className="h-48">
                      <Line
                        data={{
                          labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
                          datasets: [{
                            label: 'Accuracy',
                            data: [0.95, 0.94, 0.96, 0.95, 0.97, 0.96],
                            borderColor: 'rgb(13, 148, 136)',
                            backgroundColor: 'rgba(13, 148, 136, 0.1)',
                            fill: true
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              min: 0.9,
                              max: 1.0
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Latency Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="text-sm font-medium text-gray-700 mb-4">Latency (ms)</h6>
                    <div className="h-48">
                      <Line
                        data={{
                          labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
                          datasets: [{
                            label: 'Latency',
                            data: [45, 48, 42, 47, 43, 45],
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}