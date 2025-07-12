import React, { useState, useMemo } from 'react';
import { users } from '../data';
import Header from '../components/Header';
import FilterBar from '../components/FilterBars';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';

export default function LandingPage() {
  const [availability, setAvailability] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const perPage = 4;
  const filtered = useMemo(() => {
    return users
      .filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const loggedIn = false; 

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <FilterBar
        availability={availability}
        setAvailability={setAvailability}
        search={search}
        setSearch={setSearch}
      />

      <main className="p-4 flex flex-col gap-4">
        {paged.map((u) => (
          <UserCard key={u.id} user={u} loggedIn={loggedIn} />
        ))}

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </main>
    </div>
  );
}