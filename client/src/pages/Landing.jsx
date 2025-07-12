import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/FilterBars';
import UserCard from '../components/UserCard';
import Pagination from '../components/Pagination';
import axios from 'axios';

const isOnlineNow = (availability) => {
  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 6;
  if (availability.custom) return false;
  return isWeekend ? availability.weekends : availability.weekdays;
};

export default function LandingPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On mount, read userId that was explicitly stored at login
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    console.log('Stored userId:', storedId);
    if (storedId) {
      setCurrentUserId(storedId);
    } else {
      console.error('No userId in localStorage');
      setError('User not authenticated');
    }
  }, []);

  // Fetch matches once we have currentUserId
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    axios
      .get(`http://localhost:5001/api/auth/users/${currentUserId}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { perfectMatches, twoMatches, oneMatch, noMatch } = res.data;
        console.log('Fetched matches:', {
          perfectMatches,
          twoMatches,
          oneMatch,
          noMatch,
        });
        setMatches([
          ...perfectMatches,
          ...twoMatches,
          ...oneMatch,
          ...noMatch,
        ]);
        setError('');
      })
      .catch((err) => {
        console.error('Fetch matches error:', err.response || err);
        setError('Failed to fetch matches');
      })
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const perPage = 4;
  const filtered = useMemo(() => {
    return matches
      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      .filter((u) => {
        if (availabilityFilter === 'all') return true;
        const online = isOnlineNow(u.availability);
        return availabilityFilter === 'online' ? online : !online;
      });
  }, [matches, search, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const loggedIn = Boolean(currentUserId);

  if (loading) return <div className="p-4">Loading matches...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <FilterBar
        availability={availabilityFilter}
        setAvailability={setAvailabilityFilter}
        search={search}
        setSearch={setSearch}
      />

      <main className="p-4 flex flex-col gap-4">
        {paged.map((u) => (
          <UserCard key={u._id} user={u} loggedIn={loggedIn} />
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