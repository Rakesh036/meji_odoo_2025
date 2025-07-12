import React from 'react';

export default function FilterBar({ availability, setAvailability, search, setSearch }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50">
      <select
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="all">All Availability</option>
        <option value="online">Online Now</option>
        <option value="offline">Offline</option>
      </select>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-3 py-2 border rounded"
      />

      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
        Search
      </button>
    </div>
  );
}
