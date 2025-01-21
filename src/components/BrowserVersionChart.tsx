import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ErrorLog } from '../types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  data: ErrorLog[];
}

interface BrowserData {
  name: string;
  value: number;
}

interface VersionData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BrowserVersionChart: React.FC<Props> = ({ data }) => {
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);

  const { browserData, versionData } = useMemo(() => {
    const browsers = new Map<string, number>();
    const versions = new Map<string, Map<string, number>>();
    
    data
      .filter(log => log?.bluescreen?.ua?.brands?.[0])
      .forEach(log => {
        const mainBrowser = log.bluescreen.ua.brands[0];
        
        // Count browsers
        browsers.set(
          mainBrowser.brand,
          (browsers.get(mainBrowser.brand) || 0) + 1
        );
        
        // Count versions per browser
        if (!versions.has(mainBrowser.brand)) {
          versions.set(mainBrowser.brand, new Map());
        }
        const browserVersions = versions.get(mainBrowser.brand)!;
        browserVersions.set(
          mainBrowser.version,
          (browserVersions.get(mainBrowser.version) || 0) + 1
        );
      });

    return {
      browserData: Array.from(browsers.entries()).map(([name, value]) => ({
        name,
        value
      })),
      versionData: versions
    };
  }, [data]);

  if (browserData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No browser version data available</p>
      </div>
    );
  }

  const getVersionsForBrowser = (browser: string): VersionData[] => {
    const versions = versionData.get(browser);
    if (!versions) return [];
    return Array.from(versions.entries()).map(([version, count]) => ({
      name: `v${version}`,
      value: count
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{data.name}</p>
          <p>Count: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">
          {selectedBrowser ? (
            <button
              onClick={() => setSelectedBrowser(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
              {selectedBrowser} Versions
            </button>
          ) : (
            'Errors by Browser'
          )}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 h-[90%]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={browserData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              onClick={(data) => setSelectedBrowser(data.name)}
              className="cursor-pointer"
            >
              {browserData.map((entry, index) => (
                <Cell 
                  key={entry.name} 
                  fill={COLORS[index % COLORS.length]}
                  opacity={selectedBrowser && selectedBrowser !== entry.name ? 0.3 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer>
          {selectedBrowser ? (
            <PieChart>
              <Pie
                data={getVersionsForBrowser(selectedBrowser)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {getVersionsForBrowser(selectedBrowser).map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Click a browser to see version details</p>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BrowserVersionChart;