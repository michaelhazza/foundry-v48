import React, { useState } from 'react';
import { api } from '../lib/api';

interface TeamworkDeskConnectionConfig {
  siteName: string;
  apiKey: string;
  dataType: 'tickets';
}

interface TeamworkDeskConfigProps {
  onConfigChange: (config: TeamworkDeskConnectionConfig | null) => void;
}

export function TeamworkDeskConfig({ onConfigChange }: TeamworkDeskConfigProps) {
  const [siteName, setSiteName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  function resetTestState() {
    setTestResult(null);
    onConfigChange(null);
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await api.post<{ success: boolean; message: string }>(
        '/integrations/teamwork-desk/test-connection',
        { siteName: siteName.trim(), apiKey: apiKey.trim() }
      );
      setTestResult(result);
      if (result.success) {
        onConfigChange({ siteName: siteName.trim(), apiKey: apiKey.trim(), dataType: 'tickets' });
      } else {
        onConfigChange(null);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
      onConfigChange(null);
    } finally {
      setTesting(false);
    }
  }

  const canTest = siteName.trim().length > 0 && apiKey.trim().length > 0 && !testing;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Site Name *
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={siteName}
            onChange={(e) => { setSiteName(e.target.value); resetTestState(); }}
            placeholder="yourcompany"
            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            .teamwork.com
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          The subdomain of your Teamwork Desk account
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          API Key *
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); resetTestState(); }}
          placeholder="Your Teamwork Desk API key"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Found in your Teamwork Desk profile under API Keys
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={!canTest}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {testResult && (
        <div className={`rounded-md p-3 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      {testResult?.success && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data to Fetch
          </label>
          <select
            disabled
            value="tickets"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 sm:text-sm"
          >
            <option value="tickets">Tickets</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            All tickets from your Teamwork Desk account will be fetched
          </p>
        </div>
      )}
    </div>
  );
}
