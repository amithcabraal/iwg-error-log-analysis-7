import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, differenceInDays, addHours, addDays, startOfHour, startOfDay } from 'date-fns';
import { ErrorLog } from '../types';

interface Props {
  data: ErrorLog[];
}

const TimeSeriesChart: React.FC<Props> = ({ data }) => {
  const { chartData, games } = useMemo(() => {
    if (data.length === 0) return { chartData: [], games: [] };

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a['@timestamp']).getTime() - new Date(b['@timestamp']).getTime()
    );

    const startDate = new Date(sortedData[0]['@timestamp']);
    const endDate = new Date(sortedData[sortedData.length - 1]['@timestamp']);
    const daysDiff = differenceInDays(endDate, startDate);

    // Determine the grouping interval based on the date range
    const interval: 'hour' | 'day' = daysDiff > 7 ? 'day' : 'hour';

    // Create a map to store game counts for each interval
    const timeMap = new Map<string, { [key: string]: number }>();
    const gameSet = new Set<string>();

    // Initialize time slots
    let currentDate = interval === 'hour' ? startOfHour(startDate) : startOfDay(startDate);
    const endTime = interval === 'hour' ? startOfHour(endDate) : startOfDay(endDate);

    while (currentDate <= endTime) {
      const timeKey = format(currentDate, interval === 'hour' ? "yyyy-MM-dd HH:00" : "yyyy-MM-dd");
      timeMap.set(timeKey, {});
      currentDate = interval === 'hour' ? addHours(currentDate, 1) : addDays(currentDate, 1);
    }

    // Group data by time interval and game
    sortedData.forEach(log => {
      if (!log.bluescreen?.gameName) return;

      const timestamp = new Date(log['@timestamp']);
      const timeKey = format(timestamp, interval === 'hour' ? "yyyy-MM-dd HH:00" : "yyyy-MM-dd");
      const gameName = log.bluescreen.gameName;

      gameSet.add(gameName);
      const timeSlot = timeMap.get(timeKey) || {};
      timeSlot[gameName] = (timeSlot[gameName] || 0) + 1;
      timeMap.set(timeKey, timeSlot);
    });

    // Convert map to array format for Recharts
    return {
      chartData: Array.from(timeMap.entries()).map(([time, counts]) => ({
        time,
        ...counts
      })),
      games: Array.from(gameSet)
    };
  }, [data]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available for time series</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
          <div className="mt-1 pt-1 border-t">
            <span className="font-semibold">
              Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4">Error Time Series</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tickMargin={30}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              bottom: -40,
              left: 0,
              right: 0
            }}
          />
          {games.map((game, index) => (
            <Bar
              key={game}
              dataKey={game}
              name={game}
              stackId="a"
              fill={colors[index % colors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;