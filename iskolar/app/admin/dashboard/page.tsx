'use client';

import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [chartTimeframe, setChartTimeframe] = useState('monthly');

  return (
    <div className="p-4 lg:p-8">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Title and Subtitle */}
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">IskoLAR Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview of scholarship program metrics and tasks</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              <span>New Report</span>
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {/* Total Applicants */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">1,245</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>Up 12% from last month</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">875</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>Up 8% from last month</span>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">210</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <ArrowDownIcon className="w-4 h-4 mr-1" />
            <span>Down 5% from last week</span>
          </div>
        </div>

        {/* Scheduled Releases */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Scheduled Releases</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ClockIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>Next: Aug 30, 2025</span>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Disbursed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₱12.5M</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>Up 15% from last quarter</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Section - Pie Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Applicants by Program Type</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setChartTimeframe('monthly')}
                className={`px-3 py-1 rounded-full text-sm ${
                  chartTimeframe === 'monthly' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setChartTimeframe('quarterly')}
                className={`px-3 py-1 rounded-full text-sm ${
                  chartTimeframe === 'quarterly' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Quarterly
              </button>
              <button 
                onClick={() => setChartTimeframe('yearly')}
                className={`px-3 py-1 rounded-full text-sm ${
                  chartTimeframe === 'yearly' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="aspect-[16/9] max-h-[400px] flex items-center justify-center">
            <Doughnut 
              data={{
                labels: ['Premier', 'Full', 'Priority', 'SUC/CU', 'Review'],
                datasets: [{
                  data: [35, 25, 20, 15, 5],
                  backgroundColor: [
                    'rgb(239, 68, 68)',  // red-500
                    'rgb(59, 130, 246)', // blue-500
                    'rgb(234, 179, 8)',  // yellow-500
                    'rgb(147, 51, 234)', // purple-500
                    'rgb(107, 114, 128)' // gray-500
                  ]
                }]
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>

        {/* Right Section - Upcoming Releases */}
        <div className="space-y-6">
          {/* Upcoming Releases Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Releases</h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Allowance Release',
                  date: 'Aug 30, 2025',
                  location: 'Taguig City Auditorium',
                  days: 21
                },
                {
                  title: 'Tuition Subsidy',
                  date: 'Sept 15, 2025',
                  location: 'Taguig City Hall',
                  days: 37
                },
                {
                  title: 'Book Allowance',
                  date: 'Oct 5, 2025',
                  location: 'Taguig City University',
                  days: 57
                }
              ].map((release, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="flex-none">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{release.title}</h3>
                    <p className="text-sm text-gray-500">{release.date} • {release.location}</p>
                    <p className="text-sm text-blue-600 mt-1">in {release.days} days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Queue Widget */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Queue</h2>
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-2">
                <svg 
                  className="w-5 h-5 text-red-500 mt-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Verify New Applications</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    12 applications need verification
                  </p>
                </div>
              </div>
              <div className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm font-medium">
                12 pending
              </div>
            </div>
            <button className="mt-6 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Process Now
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                {
                  icon: "✅",
                  text: "8 applications approved",
                  time: "2 hours ago",
                  bgColor: "bg-green-50",
                  textColor: "text-green-800"
                },
                {
                  icon: "🗓️",
                  text: "Schedule updated for Allowance Release",
                  time: "Yesterday",
                  bgColor: "bg-blue-50",
                  textColor: "text-blue-800"
                },
                {
                  icon: "❌",
                  text: "3 applications rejected",
                  time: "Yesterday",
                  bgColor: "bg-red-50",
                  textColor: "text-red-800"
                }
              ].map((activity, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-3 rounded-md ${activity.bgColor}`}
                >
                  <div className="flex items-center space-x-3 flex-grow">
                    <span className="text-xl flex-shrink-0">{activity.icon}</span>
                    <span className={`text-sm font-medium ${activity.textColor}`}>
                      {activity.text}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  name: 'Maria Santos',
                  program: 'Premier',
                  school: 'University of the Philippines',
                  status: 'Pending',
                  date: 'Aug 15, 2025'
                },
                {
                  name: 'Juan Dela Cruz',
                  program: 'Full',
                  school: 'De La Salle University',
                  status: 'Approved',
                  date: 'Aug 14, 2025'
                },
                {
                  name: 'Sophia Reyes',
                  program: 'Priority',
                  school: 'Ateneo de Manila University',
                  status: 'Rejected',
                  date: 'Aug 13, 2025'
                },
                {
                  name: 'Miguel Bautista',
                  program: 'SUC/CU',
                  school: 'Taguig City University',
                  status: 'Approved',
                  date: 'Aug 12, 2025'
                }
              ].map((app, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.program}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.school}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status === 'Pending' ? '🟡' :
                       app.status === 'Approved' ? '🟢' : '🔴'} {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className={`text-blue-600 hover:text-blue-900 ${app.status === 'Pending' ? 'font-medium' : ''}`}>
                      {app.status === 'Pending' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Register the ChartJS components we need
ChartJS.register(ArcElement, Tooltip, Legend);
