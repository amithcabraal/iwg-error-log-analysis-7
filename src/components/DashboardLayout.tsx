import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ErrorLog } from '../types';
import ErrorTimeline from './ErrorTimeline';
import TimeSeriesChart from './TimeSeriesChart';
import ErrorTable from './ErrorTable';
import BrowserVersionChart from './BrowserVersionChart';
import PlatformPieChart from './PlatformPieChart';
import ErrorHeatmap from './ErrorHeatmap';
import ErrorTypeChart from './ErrorTypeChart';
import FilterPanel from './FilterPanel';
import ErrorDetailsModal from './ErrorDetailsModal';

interface Props {
  data: ErrorLog[];
}

const defaultLayout = [
  { i: 'filters', x: 0, y: 0, w: 12, h: 2, isDraggable: false },
  { i: 'timeline', x: 0, y: 2, w: 12, h: 4 },
  { i: 'timeseries', x: 0, y: 6, w: 12, h: 4 },
  { i: 'browserVersions', x: 0, y: 10, w: 12, h: 4 },
  { i: 'errorTypes', x: 0, y: 14, w: 12, h: 4 },
  { i: 'platforms', x: 0, y: 18, w: 6, h: 4 },
  { i: 'heatmap', x: 6, y: 18, w: 6, h: 4 },
  { i: 'table', x: 0, y: 22, w: 12, h: 6 }
];

const LAYOUT_STORAGE_KEY = 'dashboard-layout';

const DashboardLayout: React.FC<Props> = ({ data }) => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Math.min(...data.map(d => new Date(d['@timestamp']).getTime()))),
    new Date(Math.max(...data.map(d => new Date(d['@timestamp']).getTime())))
  ]);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useState(defaultLayout);

  useEffect(() => {
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Error loading saved layout:', e);
      }
    }
  }, []);

  const filteredData = data.filter(log => {
    const timestamp = new Date(log['@timestamp']);
    const inDateRange = timestamp >= dateRange[0] && timestamp <= dateRange[1];
    const matchesGame = selectedGames.length === 0 || selectedGames.includes(log.bluescreen?.gameName);
    const matchesBrowser = selectedBrowsers.length === 0 || 
      (log.bluescreen?.ua?.brands?.some(b => selectedBrowsers.includes(b.brand)));
    const matchesPlatform = selectedPlatforms.length === 0 ||
      (log.bluescreen?.ua?.platform && selectedPlatforms.includes(log.bluescreen.ua.platform));
    
    return inDateRange && matchesGame && matchesBrowser && matchesPlatform;
  });

  const handleLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayout));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          width={1200}
          isDraggable
          isResizable
          onDragStart={() => setIsDragging(true)}
          onDragStop={() => setIsDragging(false)}
          onLayoutChange={handleLayoutChange}
        >
          <div key="filters" className={`bg-white p-4 rounded-lg shadow ${isDragging ? 'pointer-events-none' : ''}`}>
            <FilterPanel
              data={data}
              dateRange={dateRange}
              selectedGames={selectedGames}
              selectedBrowsers={selectedBrowsers}
              selectedPlatforms={selectedPlatforms}
              onDateRangeChange={setDateRange}
              onGamesChange={setSelectedGames}
              onBrowsersChange={setSelectedBrowsers}
              onPlatformsChange={setSelectedPlatforms}
            />
          </div>
          <div key="timeline" className="bg-white p-4 rounded-lg shadow">
            <ErrorTimeline data={filteredData} />
          </div>
          <div key="timeseries" className="bg-white p-4 rounded-lg shadow">
            <TimeSeriesChart data={filteredData} />
          </div>
          <div key="browserVersions" className="bg-white p-4 rounded-lg shadow">
            <BrowserVersionChart data={filteredData} />
          </div>
          <div key="errorTypes" className="bg-white p-4 rounded-lg shadow">
            <ErrorTypeChart data={filteredData} />
          </div>
          <div key="platforms" className="bg-white p-4 rounded-lg shadow">
            <PlatformPieChart data={filteredData} />
          </div>
          <div key="heatmap" className="bg-white p-4 rounded-lg shadow">
            <ErrorHeatmap data={filteredData} />
          </div>
          <div key="table" className="bg-white p-4 rounded-lg shadow">
            <ErrorTable data={filteredData} onViewDetails={setSelectedError} />
          </div>
        </GridLayout>
      </div>

      {selectedError && (
        <ErrorDetailsModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;