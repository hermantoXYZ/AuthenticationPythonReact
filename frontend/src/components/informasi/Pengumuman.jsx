import { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight, Pin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const Pengumuman = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Jadwal Pendaftaran Wisuda Periode II Tahun 2024",
      content: "Pendaftaran wisuda periode II tahun 2024 akan dibuka mulai tanggal 1 Juli 2024. Mohon perhatikan persyaratan yang diperlukan.",
      date: "2024-03-15",
      category: "akademik",
      isPinned: true,
      link: "#"
    },
    {
      id: 2,
      title: "Info Beasiswa LPDP 2024",
      content: "Telah dibuka pendaftaran beasiswa LPDP untuk jenjang S2 dan S3. Deadline pendaftaran 30 April 2024.",
      date: "2024-03-10",
      category: "beasiswa",
      isPinned: true,
      link: "#"
    },
    {
      id: 3,
      title: "Seminar Nasional Teknologi Informasi",
      content: "Fakultas mengadakan seminar nasional dengan tema 'AI dan Masa Depan Pendidikan' pada 20 April 2024.",
      date: "2024-03-08",
      category: "event",
      isPinned: false,
      link: "#"
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.category === filter;
  });

  const categories = [
    { id: 'all', label: 'Semua', color: 'bg-gray-600' },
    { id: 'akademik', label: 'Akademik', color: 'bg-blue-600' },
    { id: 'beasiswa', label: 'Beasiswa', color: 'bg-green-600' },
    { id: 'event', label: 'Event', color: 'bg-purple-600' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pengumuman</h2>
              <p className="text-blue-100">Informasi terbaru seputar akademik</p>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${filter === category.id 
                      ? `${category.color} text-white` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="divide-y divide-gray-200">
          {filteredAnnouncements.map(announcement => (
            <div 
              key={announcement.id}
              className={`p-6 ${announcement.isPinned ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${announcement.category === 'akademik' ? 'bg-blue-100 text-blue-700' :
                        announcement.category === 'beasiswa' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'}`}
                    >
                      {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(announcement.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600">
                    {announcement.content}
                  </p>
                </div>
                <a
                  href={announcement.link}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pengumuman; 