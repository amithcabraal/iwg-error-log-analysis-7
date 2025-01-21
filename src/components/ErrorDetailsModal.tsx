import React from 'react';
import { X } from 'lucide-react';
import { ErrorLog } from '../types';

interface Props {
  error: ErrorLog | null;
  onClose: () => void;
}

const ErrorDetailsModal: React.FC<Props> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Error Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Timestamp</div>
              <div>{error['@timestamp']}</div>
              <div className="text-gray-600">Game Name</div>
              <div>{error.bluescreen.gameName}</div>
              <div className="text-gray-600">Game ID</div>
              <div>{error.bluescreen.gameid}</div>
              <div className="text-gray-600">Error Type</div>
              <div>{error.bluescreen.type}</div>
              <div className="text-gray-600">Error Message</div>
              <div className="break-all">{error.bluescreen.error}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">User Agent Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Platform</div>
              <div>{error.bluescreen.ua?.platform}</div>
              <div className="text-gray-600">Platform Version</div>
              <div>{error.bluescreen.ua?.platformVersion}</div>
              <div className="text-gray-600">Mobile</div>
              <div>{error.bluescreen.ua?.mobile ? 'Yes' : 'No'}</div>
              <div className="text-gray-600">Browsers</div>
              <div>
                {error.bluescreen.ua?.brands.map((brand, index) => (
                  <div key={index}>
                    {brand.brand} v{brand.version}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Session Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Error Time</div>
              <div>
                {error.bluescreen.sessionInfo?.errorTime ? 
                  `${error.bluescreen.sessionInfo.errorTime.year}-${error.bluescreen.sessionInfo.errorTime.month}-${error.bluescreen.sessionInfo.errorTime.day} ` +
                  `${error.bluescreen.sessionInfo.errorTime.hour}:${error.bluescreen.sessionInfo.errorTime.min}:${error.bluescreen.sessionInfo.errorTime.sec}`
                  : 'N/A'}
              </div>
              <div className="text-gray-600">Window Size</div>
              <div>
                {error.bluescreen.sessionInfo?.initialWidth}x{error.bluescreen.sessionInfo?.initialHeight}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Raw Data</h3>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetailsModal;