'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Guru {
  id: number;
  name: string;
  nip: string;
}

interface Absensi {
  id: number;
  guru: Guru;
  status: string;
  tanggal: string;
}

export default function EditAbsensiPage() {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [selectedGuruId, setSelectedGuruId] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchGurus();
    fetchAbsensi();
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
    } catch (err) {
      setError('Gagal memuat data guru');
      console.error(err);
    }
  };

  const fetchAbsensi = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const id = params.id as string;
      const response = await fetch(`/api/absensi/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch absensi');
      }

      const absensi = await response.json();
      setSelectedGuruId(absensi.guruId);
      setStatus(absensi.status);
      setTanggal(new Date(absensi.tanggal).toISOString().split('T')[0]);
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat data absensi');
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

      const id = params.id as string;
      const response = await fetch(`/api/absensi/${id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update absensi');
      }

      alert('Data absensi berhasil diperbarui');
      router.push('/dashboard/absensi');
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui absensi');
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Data Absensi</h1>

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
                {submitting ? 'Memproses...' : 'Simpan Perubahan'}
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