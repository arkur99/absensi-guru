'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Guru {
  id: number;
  name: string;
  nip: string;
}

export default function TambahAbsensiPage() {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [selectedGuruId, setSelectedGuruId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGurus();
  }, []);

  const fetchGurus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/guru', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch gurus');
      }

      const data = await response.json();
      setGurus(data.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat data guru');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!selectedGuruId || !status || !tanggal) {
      setError('Semua field harus diisi');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          guruId: selectedGuruId,
          status,
          tanggal,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create absensi');
      }

      alert('Absensi berhasil ditambahkan');
      router.push('/dashboard/absensi');
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan absensi');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Input Absensi Guru</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="guru" className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Guru
              </label>
              <select
                id="guru"
                value={selectedGuruId || ''}
                onChange={(e) => setSelectedGuruId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Pilih Guru --</option>
                {gurus.map((guru) => (
                  <option key={guru.id} value={guru.id}>
                    {guru.name} (NIP: {guru.nip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                id="tanggal"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status Kehadiran
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">-- Pilih Status --</option>
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="alpa">Alpa</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-2 px-4 rounded-md text-white ${
                  submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {submitting ? 'Memproses...' : 'Simpan Absensi'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}