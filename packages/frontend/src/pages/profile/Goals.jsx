import React, { useState } from "react";
import { useAuth } from "../../context/auth.context.jsx";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState({
    primaryGoal: user?.goals?.primaryGoal || "",
    targetWeight: user?.goals?.targetWeight || "",
    targetDate: user?.goals?.targetDate || "",
    weeklyWorkouts: user?.goals?.weeklyWorkouts || 3,
    workoutDuration: user?.goals?.workoutDuration || 60,
    specificGoals: user?.goals?.specificGoals || [],
    motivation: user?.goals?.motivation || "",
  });

  const primaryGoalOptions = [
    { value: "weight_loss", label: "Giảm cân", description: "Tập trung vào việc giảm cân và đốt cháy mỡ thừa" },
    { value: "muscle_gain", label: "Tăng cơ", description: "Xây dựng khối lượng cơ bắp và sức mạnh" },
    { value: "endurance", label: "Tăng sức bền", description: "Cải thiện khả năng chịu đựng và tim mạch" },
    { value: "flexibility", label: "Tăng độ dẻo dai", description: "Cải thiện tính linh hoạt và phạm vi chuyển động" },
    { value: "general_fitness", label: "Sức khỏe tổng quát", description: "Duy trì sức khỏe và thể lực tổng thể" },
    { value: "sport_specific", label: "Thể thao cụ thể", description: "Tập luyện cho một môn thể thao cụ thể" }
  ];

  const specificGoalOptions = [
    "Chạy 5km không nghỉ",
    "Nâng được 100kg",
    "Giảm 10kg trong 3 tháng",
    "Tăng 5kg cơ bắp",
    "Chạy marathon",
    "Thực hiện được handstand",
    "Tăng sức bền tim mạch",
    "Giảm mỡ bụng",
    "Tăng cơ tay",
    "Cải thiện tư thế"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSpecificGoalToggle = (goal) => {
    setGoals(prev => ({
      ...prev,
      specificGoals: prev.specificGoals.includes(goal)
        ? prev.specificGoals.filter(g => g !== goal)
        : [...prev.specificGoals, goal]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to save goals
    console.log("Saving goals:", goals);
    alert("Mục tiêu đã được lưu!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderLogin />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Mục tiêu fitness</h1>
            <p className="text-gray-600">Đặt mục tiêu và theo dõi tiến độ của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Primary Goal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu chính</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {primaryGoalOptions.map(option => (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="primaryGoal"
                      value={option.value}
                      checked={goals.primaryGoal === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-colors ${
                      goals.primaryGoal === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          goals.primaryGoal === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {goals.primaryGoal === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{option.label}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Weight and Date */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu cụ thể</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cân nặng mục tiêu (kg)
                  </label>
                  <input
                    type="number"
                    name="targetWeight"
                    value={goals.targetWeight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="65"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian đạt mục tiêu
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    value={goals.targetDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Workout Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch tập luyện</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số buổi tập mỗi tuần
                  </label>
                  <select
                    name="weeklyWorkouts"
                    value={goals.weeklyWorkouts}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 buổi/tuần</option>
                    <option value={2}>2 buổi/tuần</option>
                    <option value={3}>3 buổi/tuần</option>
                    <option value={4}>4 buổi/tuần</option>
                    <option value={5}>5 buổi/tuần</option>
                    <option value={6}>6 buổi/tuần</option>
                    <option value={7}>7 buổi/tuần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian mỗi buổi tập (phút)
                  </label>
                  <select
                    name="workoutDuration"
                    value={goals.workoutDuration}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                    <option value={90}>90 phút</option>
                    <option value={120}>120 phút</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specific Goals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu cụ thể</h3>
              <p className="text-sm text-gray-600 mb-4">Chọn các mục tiêu bạn muốn đạt được</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specificGoalOptions.map(goal => (
                  <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={goals.specificGoals.includes(goal)}
                      onChange={() => handleSpecificGoalToggle(goal)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Motivation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Động lực</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều gì thúc đẩy bạn tập luyện?
                </label>
                <textarea
                  name="motivation"
                  value={goals.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hãy viết về động lực và lý do bạn muốn đạt được mục tiêu này..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu mục tiêu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
