import React, { useMemo } from 'react';
import { ErrorLog } from '../types';

interface Props {
  data: ErrorLog[];
}

const ErrorHeatmap: React.FC<Props> = ({ data }) => {
  const heatmapData = useMemo(() => {
    const gameOsMap = new Map<string, Map<string, number>>();
    let maxErrors = 0;
    
    // Count errors for each game-OS combination
    data
      .filter(log => log?.bluescreen?.gameName && log?.bluescreen?.ua?.platform)
      .forEach(log => {
        const gameName = log.bluescreen.gameName;
        const os = log.bluescreen.ua.platform;
        
        if (!gameOsMap.has(gameName)) {
          gameOsMap.set(gameName, new Map());
        }
        
        const osMap = gameOsMap.get(gameName)!;
        const currentCount = osMap.get(os) || 0;
        osMap.set(os, currentCount + 1);
        maxErrors = Math.max(maxErrors, currentCount + 1);
      });

    // Get unique lists of games and operating systems
    const games = Array.from(gameOsMap.keys()).sort();
    const operatingSystems = Array.from(
      new Set(data
        .filter(log => log?.bluescreen?.ua?.platform)
        .map(log => log.bluescreen.ua.platform)
      )
    ).sort();

    return {
      games,
      operatingSystems,
      gameOsMap,
      maxErrors
    };
  }, [data]);

  // Function to calculate color based on value
  const getBackgroundColor = (value: number, max: number) => {
    if (value === 0) return 'bg-gray-50';
    const intensity = Math.min(value / max, 1);
    const red = Math.round(intensity * 255);
    const green = Math.round((1 - intensity) * 192);
    return `rgb(${red}, ${green}, 0)`;
  };

  const getTextColor = (value: number, max: number) => {
    const intensity = value / max;
    return intensity > 0.5 ? 'text-white' : 'text-gray-900';
  };

  if (heatmapData.games.length === 0 || heatmapData.operatingSystems.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Error Distribution Heatmap</h2>
      <div className="relative overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-10 bg-white px-4 py-2 border"></th>
              {heatmapData.operatingSystems.map(os => (
                <th key={os} className="px-4 py-2 border font-medium text-sm">
                  {os}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.games.map(game => (
              <tr key={game}>
                <th className="sticky left-0 bg-white px-4 py-2 border text-left font-medium text-sm">
                  {game}
                </th>
                {heatmapData.operatingSystems.map(os => {
                  const value = heatmapData.gameOsMap.get(game)?.get(os) || 0;
                  return (
                    <td
                      key={`${game}-${os}`}
                      className={`px-4 py-2 border text-center transition-colors ${getBackgroundColor(
                        value,
                        heatmapData.maxErrors
                      )} ${getTextColor(value, heatmapData.maxErrors)}`}
                    >
                      {value || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorHeatmap;