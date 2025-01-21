import React from 'react';
import { ErrorLog } from '../types';
import { format } from 'date-fns';

interface Props {
  data: ErrorLog[];
  dateRange: [Date, Date];
  selectedGames: string[];
  selectedBrowsers: string[];
  selectedPlatforms: string[];
  onDateRangeChange: (range: [Date, Date]) => void;
  onGamesChange: (games: string[]) => void;
  onBrowsersChange: (browsers: string[]) => void;
  onPlatformsChange: (platforms: string[]) => void;
}

const FilterPanel: React.FC<Props> = ({
  data,
  dateRange,
  selectedGames,
  selectedBrowsers,
  selectedPlatforms,
  onDateRangeChange,
  onGamesChange,
  onBrowsersChange,
  onPlatformsChange,
}) => {
  // Get unique games, handling null/undefined values
  const games = Array.from(new Set(data
    .filter(log => log?.bluescreen?.gameName)
    .map(log => log.bluescreen.gameName)
  )).sort();

  // Get unique browsers, handling null/undefined values
  const browsers = Array.from(new Set(data
    .filter(log => log?.bluescreen?.ua?.brands?.[0]?.brand)
    .flatMap(log => log.bluescreen.ua.brands.map(b => b.brand))
  )).sort();

  // Get unique platforms, handling null/undefined values
  const platforms = Array.from(new Set(data
    .filter(log => log?.bluescreen?.ua?.platform)
    .map(log => log.bluescreen.ua.platform)
  )).sort();

  const formatDateForInput = (date: Date) => {
    try {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    }
  };

  const handleMultiSelect = (
    event: React.ChangeEvent<HTMLSelectElement>,
    onChange: (selected: string[]) => void
  ) => {
    const options = Array.from(event.target.selectedOptions).map(option => option.value);
    onChange(options);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <div className="space-y-2">
          <input
            type="datetime-local"
            value={formatDateForInput(dateRange[0])}
            onChange={e => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onDateRangeChange([newDate, dateRange[1]]);
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="datetime-local"
            value={formatDateForInput(dateRange[1])}
            onChange={e => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onDateRangeChange([dateRange[0], newDate]);
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Games</label>
        <select
          multiple
          value={selectedGames}
          onChange={e => handleMultiSelect(e, onGamesChange)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-24"
        >
          {games.map(game => (
            <option key={game} value={game}>{game}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Browsers</label>
        <select
          multiple
          value={selectedBrowsers}
          onChange={e => handleMultiSelect(e, onBrowsersChange)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-24"
        >
          {browsers.map(browser => (
            <option key={browser} value={browser}>{browser}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platforms</label>
        <select
          multiple
          value={selectedPlatforms}
          onChange={e => handleMultiSelect(e, onPlatformsChange)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-24"
        >
          {platforms.map(platform => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;