import React from 'react';
export default function Pagination({ page, totalPages, setPage }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex gap-2 justify-center my-4">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded border
            ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}