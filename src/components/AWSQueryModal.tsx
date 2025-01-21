import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AWSQueryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const query = `fields @timestamp, message, msg, @logStream, @log,
  jsonParse(msg) as jObj,
  jObj.bluescreen as bluescreen,
  jObj.bluescreen.error
| filter msg like /bluescreen/
| limit 10000`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AWS Logs Insights Query</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">Query</h3>
              <button
                onClick={handleCopy}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm font-mono">{query}</pre>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open AWS CloudWatch Logs Insights</li>
              <li>Select all log groups that end with "-web-cluster"</li>
              <li>Paste the above query into the query editor</li>
              <li>Adjust the time range as needed</li>
              <li>Click "Run query" to execute</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWSQueryModal;