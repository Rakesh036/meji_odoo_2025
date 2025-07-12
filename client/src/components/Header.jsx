import React from 'react';
import { Link } from 'react-router-dom';
export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold">Skill Swap Platform</h1>
      <Link
        to="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
      >
        Login
      </Link>
    </header>
  );
}