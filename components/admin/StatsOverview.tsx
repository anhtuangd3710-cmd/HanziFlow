'use client';

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UsersIcon } from '../icons/UsersIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';

interface StatsOverviewProps {
  userCount: number;
  setCount: number;
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const StatsOverview: React.FC<StatsOverviewProps> = ({ userCount, setCount, isLoading }) => {
  // Sample data for pie chart
  const pieData = [
    { name: 'Users', value: userCount, fill: '#3b82f6' },
    { name: 'Sets', value: Math.max(setCount, 1), fill: '#10b981' },
  ];

  // Sample bar chart data for activity
  const barData = [
    { day: 'Mon', users: Math.floor(userCount * 0.6), sets: Math.floor(setCount * 0.5) },
    { day: 'Tue', users: Math.floor(userCount * 0.7), sets: Math.floor(setCount * 0.6) },
    { day: 'Wed', users: Math.floor(userCount * 0.8), sets: Math.floor(setCount * 0.7) },
    { day: 'Thu', users: userCount, sets: setCount },
    { day: 'Fri', users: Math.floor(userCount * 0.9), sets: Math.floor(setCount * 0.8) },
    { day: 'Sat', users: Math.floor(userCount * 0.7), sets: Math.floor(setCount * 0.6) },
    { day: 'Sun', users: Math.floor(userCount * 0.5), sets: Math.floor(setCount * 0.4) },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Total Users</p>
              {isLoading ? (
                <div className="h-10 w-20 bg-blue-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-4xl font-bold text-blue-600 mt-2">{userCount.toLocaleString()}</p>
              )}
            </div>
            <div className="bg-blue-500 p-4 rounded-full">
              <UsersIcon className="text-white" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold text-sm uppercase tracking-wide">Total Sets</p>
              {isLoading ? (
                <div className="h-10 w-20 bg-green-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-4xl font-bold text-green-600 mt-2">{setCount.toLocaleString()}</p>
              )}
            </div>
            <div className="bg-green-500 p-4 rounded-full">
              <ClipboardListIcon className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" name="Users" />
              <Bar dataKey="sets" fill="#10b981" name="Sets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
