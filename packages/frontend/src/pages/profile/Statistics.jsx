import React, { useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Statistics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');

  // Mock data for statistics
  const stats = {
    totalWorkouts: 45,
    totalDuration: 2250, // minutes
    caloriesBurned: 12500,
    weightChange: -3.2,
    strengthProgress: 15,
    cardioProgress: 8,
    consistency: 85
  };

  const recentWorkouts = [
    { date: '2024-01-15', type: 'Strength Training', duration: 60, calories: 350 },
    { date: '2024-01-14', type: 'Cardio', duration: 45, calories: 280 },
    { date: '2024-01-13', type: 'Yoga', duration: 30, calories: 150 },
    { date: '2024-01-12', type: 'HIIT', duration: 40, calories: 400 },
    { date: '2024-01-11', type: 'Strength Training', duration: 75, calories: 420 },
  ];

  const achievements = [
    { name: 'Người mới bắt đầu', description: 'Hoàn thành 5 buổi tập đầu tiên', earned: true, date: '2024-01-10' },
    { name: 'Kiên trì', description: 'Tập luyện 7 ngày liên tiếp', earned: true, date: '2024-01-08' },
    { name: 'Đốt cháy', description: 'Đốt cháy 1000 calo trong một buổi tập', earned: false, date: null },
    { name: 'Thép', description: 'Nâng được 100kg', earned: false, date: null },
  ];

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getWorkoutTypeColor = (type) => {
    switch (type) {
      case 'Strength Training':
        return 'bg-red-100 text-red-800';
      case 'Cardio':
        return 'bg-blue-100 text-blue-800';
      case 'Yoga':
        return 'bg-green-100 text-green-800';
      case 'HIIT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-gray-600">Theo dõi tiến độ và thành tích của bạn</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: '7days', label: '7 ngày' },
              { value: '30days', label: '30 ngày' },
              { value: '90days', label: '90 ngày' },
              { value: '1year', label: '1 năm' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng buổi tập</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thời gian tập</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calo đốt cháy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.caloriesBurned.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thay đổi cân nặng</p>
                <p className={`text-2xl font-bold ${stats.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.weightChange > 0 ? '+' : ''}{stats.weightChange}kg
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Buổi tập gần đây</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{workout.type}</p>
                      <p className="text-sm text-gray-600">{workout.date}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkoutTypeColor(workout.type)}`}>
                        {workout.type}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDuration(workout.duration)}</p>
                        <p className="text-xs text-gray-600">{workout.calories} cal</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thành tích</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {achievements.map((achievement, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {achievement.earned ? (
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{achievement.name}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-gray-500">Đạt được: {achievement.date}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Charts Placeholder */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ sức mạnh</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Biểu đồ tiến độ sức mạnh (+{stats.strengthProgress}%)</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ tim mạch</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Biểu đồ tiến độ tim mạch (+{stats.cardioProgress}%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
