import React from 'react';
import { MessageSquare, BookOpen, BellRing, Settings2, ExternalLink, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Integration {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  connected: boolean;
  settings?: {
    channel?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    time?: string;
  };
}

export function IntegrationsPanel() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = React.useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      description: 'Send analysis insights and reports directly to your Slack channels',
      connected: false
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      icon: MessageSquare,
      description: 'Share insights and collaborate with your team in Microsoft Teams',
      connected: false
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: BookOpen,
      description: 'Export analysis results and documentation to Notion pages',
      connected: false
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = React.useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = React.useState(false);

  const handleConnect = async (integration: Integration) => {
    try {
      const updatedIntegrations = integrations.map(i =>
        i.id === integration.id
          ? {
              ...i,
              connected: true,
              settings: {
                channel: 'general',
                frequency: 'weekly' as const,
                time: '09:00'
              }
            }
          : i
      );
      setIntegrations(updatedIntegrations);
      setSelectedIntegration(updatedIntegrations.find(i => i.id === integration.id) || null);
      setIsConfiguring(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      const updatedIntegrations = integrations.map(i =>
        i.id === integration.id
          ? { ...i, connected: false, settings: undefined }
          : i
      );
      setIntegrations(updatedIntegrations);
      setSelectedIntegration(null);
      setIsConfiguring(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleUpdateSettings = async (
    integration: Integration,
    settings: Integration['settings']
  ) => {
    try {
      const updatedIntegrations = integrations.map(i =>
        i.id === integration.id
          ? { ...i, settings }
          : i
      );
      setIntegrations(updatedIntegrations);
      setIsConfiguring(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">External Integrations</h2>
        <BellRing className="w-5 h-5 text-teal-600" />
      </div>

      <div className="grid gap-6">
        {integrations.map(integration => (
          <div
            key={integration.id}
            className="border rounded-lg p-4 hover:border-teal-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <integration.icon className="w-6 h-6 text-teal-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              
              {integration.connected ? (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(integration)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-teal-600 border border-teal-200 rounded hover:bg-teal-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>

            {integration.connected && integration.settings && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Settings</h4>
                  <button
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setIsConfiguring(true);
                    }}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Channel</span>
                    <span className="text-gray-900">#{integration.settings.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency</span>
                    <span className="text-gray-900">
                      {integration.settings.frequency.charAt(0).toUpperCase() +
                        integration.settings.frequency.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900">{integration.settings.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDisconnect(integration)}
                  className="mt-4 w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings Modal */}
      {isConfiguring && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Configure {selectedIntegration.name}</h3>
              <button
                onClick={() => setIsConfiguring(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateSettings(selectedIntegration, {
                  channel: formData.get('channel') as string,
                  frequency: formData.get('frequency') as 'daily' | 'weekly' | 'monthly',
                  time: formData.get('time') as string
                });
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                  Channel
                </label>
                <input
                  type="text"
                  id="channel"
                  name="channel"
                  defaultValue={selectedIntegration.settings?.channel}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Update Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  defaultValue={selectedIntegration.settings?.frequency}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  defaultValue={selectedIntegration.settings?.time}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsConfiguring(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}