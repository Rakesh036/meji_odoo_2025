import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  // Placeholder data
  const [swapStats, setSwapStats] = useState([
    { status: 'Pending', count: 20 },
    { status: 'Accepted', count: 15 },
    { status: 'Cancelled', count: 5 },
  ]);

  const [skillsToReview, setSkillsToReview] = useState([
    { id: 1, user: 'Alice', skill: 'Photoshop', description: 'Spam link: buy now!' },
    { id: 2, user: 'Bob', skill: 'React', description: 'Check out my tutorial!' },
  ]);

  const [usersToBan, setUsersToBan] = useState([
    { id: 1, name: 'Spammer123', reason: 'Inappropriate description' },
  ]);

  const handleApproveSkill = (id) => {
    setSkillsToReview(skillsToReview.filter((s) => s.id !== id));
  };

  const handleRejectSkill = (id) => {
    setSkillsToReview(skillsToReview.filter((s) => s.id !== id));
  };

  const handleBanUser = (id) => {
    setUsersToBan(usersToBan.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Swap Stats */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Swap Request Overview</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={swapStats} className="mx-auto">
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" className="fill-indigo-600" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center">
          Download Report
        </button>
      </div>

      {/* Skills Moderation */}
      <div className="bg-white rounded-2xl shadow p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Review Skill Descriptions</h2>
        <table className="w-full text-left table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Skill</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skillsToReview.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-2">{item.user}</td>
                <td className="px-4 py-2">{item.skill}</td>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleApproveSkill(item.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectSkill(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban Users */}
      <div className="bg-white rounded-2xl shadow p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Ban Users</h2>
        <table className="w-full text-left table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {usersToBan.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.reason}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleBanUser(u.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Platform Messages & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Send Platform Message</h2>
          <textarea
            rows={4}
            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Type your message here..."
          />
          <button className="self-end px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Send
          </button>
        </div>

        {/* Reports */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Download Reports</h2>
          <button className="mb-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
            User Activity Log
          </button>
          <button className="mb-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
            Feedback Log
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Swap Stats
          </button>
        </div>
      </div>
    </div>
  );
}
