import React from 'react';
import { Upload } from 'lucide-react';
import { ErrorLog } from '../types';

interface Props {
  onDataLoaded: (data: ErrorLog[]) => void;
}

function parseAwsCliFormat(data: any): ErrorLog[] {
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Invalid AWS CLI format: missing results array');
  }

  return data.results.map(result => {
    // Each result is an array of field objects
    const fields = result.reduce((acc: any, field: any) => {
      acc[field.field] = field.value;
      return acc;
    }, {});

    // Try to parse the bluescreen data from different possible fields
    let bluescreenData;
    try {
      // First try the parsed jObj field
      if (fields.jObj) {
        bluescreenData = typeof fields.jObj === 'string' ? JSON.parse(fields.jObj) : fields.jObj;
      }
      // Then try the bluescreen field
      else if (fields.bluescreen) {
        bluescreenData = typeof fields.bluescreen === 'string' ? JSON.parse(fields.bluescreen) : fields.bluescreen;
      }
      // Finally try the msg field
      else if (fields.msg) {
        bluescreenData = JSON.parse(fields.msg);
      }
    } catch (e) {
      console.error('Error parsing bluescreen data:', e);
      return null;
    }

    if (!bluescreenData) {
      return null;
    }

    return {
      '@timestamp': fields['@timestamp'],
      ...bluescreenData
    };
  }).filter(Boolean) as ErrorLog[];
}

function parseLogsInsightsFormat(data: any[]): ErrorLog[] {
  return data.map(item => ({
    '@timestamp': item['@timestamp'],
    ...item
  }));
}

const FileUpload: React.FC<Props> = ({ onDataLoaded }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Determine the format and parse accordingly
        let parsedData: ErrorLog[];
        if (jsonData.results && Array.isArray(jsonData.results)) {
          // AWS CLI format
          parsedData = parseAwsCliFormat(jsonData);
        } else if (Array.isArray(jsonData)) {
          // Logs Insights format
          parsedData = parseLogsInsightsFormat(jsonData);
        } else {
          throw new Error('Unrecognized JSON format');
        }

        onDataLoaded(parsedData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file. Please ensure it is valid JSON in either AWS Logs Insights or AWS CLI format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <label className="flex flex-col items-center cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400" />
        <span className="mt-2 text-sm text-gray-500">Upload JSON file</span>
        <input
          type="file"
          className="hidden"
          accept="application/json"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};

export default FileUpload;