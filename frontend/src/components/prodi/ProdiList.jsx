import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, BookOpen, Award, GraduationCap, Hash } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';


const ProdiList = () => {
  const [prodiList, setProdiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('');
  const [filterAkreditasi, setFilterAkreditasi] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const response = await api.get('/api/prodi/');
        setProdiList(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prodi:', error);
        toast.error('Gagal memuat data Program Studi');
        setIsLoading(false);
      }
    };

    fetchProdi();
  }, []);

  console.log(prodiList);

  // Get unique values for filters
  const uniqueJenjang = useMemo(() => {
    return [...new Set(prodiList.map(prodi => prodi.jenjang))];
  }, [prodiList]);

  const uniqueAkreditasi = useMemo(() => {
    return [...new Set(prodiList.map(prodi => prodi.akreditasi))];
  }, [prodiList]);

  // Filter and sort data
  const filteredAndSortedProdi = useMemo(() => {
    let filtered = prodiList.filter(prodi => {
      const matchesSearch = prodi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prodi.kode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJenjang = !filterJenjang || prodi.jenjang === filterJenjang;
      const matchesAkreditasi = !filterAkreditasi || prodi.akreditasi === filterAkreditasi;
      
      return matchesSearch && matchesJenjang && matchesAkreditasi;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [prodiList, searchTerm, filterJenjang, filterAkreditasi, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterJenjang('');
    setFilterAkreditasi('');
    setSortBy('nama');
    setSortOrder('asc');
  };

  const getAkreditasiColor = (akreditasi) => {
    switch (akreditasi) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Program Studi</h1>
        <p className="text-gray-600">Temukan program studi yang sesuai dengan minat Anda</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari program studi atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filter & Urutkan
          </button>
          
          {(searchTerm || filterJenjang || filterAkreditasi || sortBy !== 'nama') && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenjang</label>
              <select
                value={filterJenjang}
                onChange={(e) => setFilterJenjang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jenjang</option>
                {uniqueJenjang.map(jenjang => (
                  <option key={jenjang} value={jenjang}>{jenjang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Akreditasi</label>
              <select
                value={filterAkreditasi}
                onChange={(e) => setFilterAkreditasi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Akreditasi</option>
                {uniqueAkreditasi.map(akreditasi => (
                  <option key={akreditasi} value={akreditasi}>{akreditasi}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="nama">Nama</option>
                  <option value="kode">Kode</option>
                  <option value="jenjang">Jenjang</option>
                  <option value="akreditasi">Akreditasi</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Menampilkan {filteredAndSortedProdi.length} dari {prodiList.length} program studi
        </p>
      </div>

      {/* Program Studi Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedProdi.map((prodi) => (
          <div key={prodi.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{prodi.nama}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>{prodi.kode}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAkreditasiColor(prodi.akreditasi)}`}>
                  {prodi.akreditasi}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Jenjang:</span>
                    <span>{prodi.jenjang}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Gelar:</span>
                    <span>{prodi.gelar}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Akreditasi:</span>
                    <span className="font-semibold">{prodi.akreditasi}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProdi.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada program studi ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian atau filter Anda</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default ProdiList;