import { useState, useEffect } from 'react'
import axios from 'axios'

export default function DebugInfo() {
  const [expanded, setExpanded] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    checking: true,
    backendReachable: false,
    error: null,
    latency: null
  })

  const checkConnection = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    // Health endpoint is at /health (not /api/health)
    // Extract base URL and add /health
    const baseUrl = apiUrl.replace(/\/api$/, '')
    const healthUrl = `${baseUrl}/health`
    const startTime = Date.now()
    
    console.log('🔍 Debug - Checking connection:', {
      apiUrl,
      baseUrl,
      healthUrl,
      timestamp: new Date().toISOString()
    })
    
    setConnectionStatus(prev => ({ ...prev, checking: true }))
    
    try {
      const response = await axios.get(healthUrl, { 
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const latency = Date.now() - startTime
      
      console.log('✅ Connection successful:', response.data)
      
      setConnectionStatus({
        checking: false,
        backendReachable: true,
        error: null,
        latency,
        response: response.data,
        testedUrl: healthUrl
      })
    } catch (error) {
      const latency = Date.now() - startTime
      
      console.error('❌ Connection failed:', {
        url: healthUrl,
        error: error.message,
        code: error.code,
        response: error.response?.data
      })
      
      setConnectionStatus({
        checking: false,
        backendReachable: false,
        latency,
        testedUrl: healthUrl,
        error: {
          message: error.message,
          code: error.code,
          type: error.response ? 'Server Error' : 'Network Error',
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const debugInfo = {
    'API URL': import.meta.env.VITE_API_URL || '/api',
    'Tested URL': connectionStatus.testedUrl || 'Not tested yet',
    'Environment': import.meta.env.MODE,
    'Window Location': window.location.href,
    'User Agent': navigator.userAgent,
    'Online Status': navigator.onLine ? '✅ Online' : '❌ Offline',
    'Connection Status': connectionStatus.checking 
      ? '⏳ Checking...' 
      : connectionStatus.backendReachable 
        ? `✅ Connected (${connectionStatus.latency}ms)` 
        : '❌ Cannot reach backend'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-mono shadow-lg hover:bg-gray-700 transition-colors"
      >
        {expanded ? '❌ Close Debug' : '🐛 Debug Info'}
      </button>

      {expanded && (
        <div className="mt-2 bg-gray-900 text-white rounded-lg shadow-2xl max-w-md overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold text-lg mb-2">🐛 Debug Information</h3>
            <button
              onClick={checkConnection}
              disabled={connectionStatus.checking}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded disabled:opacity-50"
            >
              {connectionStatus.checking ? '⏳ Checking...' : '🔄 Recheck Connection'}
            </button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3 text-xs font-mono">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="border-b border-gray-700 pb-2">
                  <div className="text-gray-400">{key}:</div>
                  <div className="text-green-400 break-all mt-1">{value}</div>
                </div>
              ))}

              {connectionStatus.error && (
                <div className="border-b border-gray-700 pb-2">
                  <div className="text-gray-400">Error Details:</div>
                  <pre className="text-red-400 mt-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(connectionStatus.error, null, 2)}
                  </pre>
                </div>
              )}

              {connectionStatus.response && (
                <div className="border-b border-gray-700 pb-2">
                  <div className="text-gray-400">Backend Response:</div>
                  <pre className="text-green-400 mt-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(connectionStatus.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-800 text-xs text-gray-400">
            💡 Open browser console (F12) for detailed logs
          </div>
        </div>
      )}
    </div>
  )
}
