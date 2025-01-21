import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ErrorLog } from '../types';
import { ArrowUpDown } from 'lucide-react';

interface Props {
  data: ErrorLog[];
}

interface ErrorTypeData {
  type: string;
  count: number;
  percentage: number;
}

const ErrorTypeChart: React.FC<Props> = ({ data }) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'count', desc: true }
  ]);

  const errorData: ErrorTypeData[] = React.useMemo(() => {
    const counts = data
      .filter(log => log?.bluescreen?.error)
      .reduce((acc: { [key: string]: number }, log) => {
        const error = log.bluescreen.error;
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {});

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: (count / total) * 100
    }));
  }, [data]);

  const columnHelper = createColumnHelper<ErrorTypeData>();

  const columns = [
    columnHelper.accessor('type', {
      header: 'Error Type',
      cell: info => (
        <div className="max-w-md truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('count', {
      header: ({ column }) => (
        <div className="flex items-center justify-end cursor-pointer" onClick={() => column.toggleSorting()}>
          Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: info => <div className="text-right">{info.getValue()}</div>,
    }),
    columnHelper.accessor('percentage', {
      header: ({ column }) => (
        <div className="flex items-center justify-end cursor-pointer" onClick={() => column.toggleSorting()}>
          Percentage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: info => <div className="text-right">{info.getValue().toFixed(1)}%</div>,
    }),
  ];

  const table = useReactTable({
    data: errorData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (errorData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No error type data available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Errors by Type</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ErrorTypeChart;