import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ErrorLog, ChartData } from '../types';

interface Props {
  data: ErrorLog[];
}

interface InternalChartData extends ChartData {
  originalTimestamp: Date;
}

const ErrorTimeline: React.FC<Props> = ({ data }) => {
  // First, create a map to store all data points for each game and timestamp
  const dataMap = new Map<string, Map<string, number>>();
  const timestamps = new Set<string>();
  const games = new Set<string>();

  // Process the data
  data.forEach(log => {
    if (!log || !log['@timestamp'] || !log.bluescreen?.gameName) return;

    try {
      const originalTimestamp = parseISO(log['@timestamp']);
      const timestamp = format(originalTimestamp, 'yyyy-MM-dd HH:mm');
      const gameName = log.bluescreen.gameName;

      timestamps.add(timestamp);
      games.add(gameName);

      if (!dataMap.has(gameName)) {
        dataMap.set(gameName, new Map());
      }

      const gameData = dataMap.get(gameName)!;
      gameData.set(timestamp, (gameData.get(timestamp) || 0) + 1);
    } catch (error) {
      console.warn('Error processing log entry:', error);
    }
  });

  // Convert timestamps to array and sort chronologically
  const sortedTimestamps = Array.from(timestamps).sort((a, b) => {
    return parseISO(a).getTime() - parseISO(b).getTime();
  });

  // Create the chart data with all timestamps for each game
  const chartData = sortedTimestamps.map(timestamp => {
    const dataPoint: any = { timestamp };
    games.forEach(game => {
      dataPoint[game] = dataMap.get(game)?.get(timestamp) || 0;
    });
    return dataPoint;
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  // Show a message if no valid data
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No valid data available for timeline</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4">Error Timeline</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tickMargin={30}
          />
          <YAxis />
          <Tooltip />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              bottom: -40,
              left: 0,
              right: 0
            }}
          />
          {Array.from(games).map((game, index) => (
            <Bar
              key={game}
              dataKey={game}
              stackId="a"
              fill={colors[index % colors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ErrorTimeline;