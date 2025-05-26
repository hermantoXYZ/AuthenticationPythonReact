import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const KalenderAkademik = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2023-2024-2');

  const periods = [
    { id: '2023-2024-2', label: 'Semester Genap 2023/2024' },
    { id: '2023-2024-1', label: 'Semester Ganjil 2023/2024' },
    { id: '2022-2023-2', label: 'Semester Genap 2022/2023' }
  ];

  const events = [
    {
      period: '2023-2024-2',
      events: [
        {
          title: 'Registrasi Akademik',
          startDate: '2024-02-01',
          endDate: '2024-02-10',
          type: 'registration',
          description: 'Periode registrasi akademik dan pembayaran UKT'
        },
        {
          title: 'Perkuliahan',
          startDate: '2024-02-12',
          endDate: '2024-06-07',
          type: 'lecture',
          description: 'Masa perkuliahan aktif'
        },
        {
          title: 'Ujian Tengah Semester',
          startDate: '2024-04-01',
          endDate: '2024-04-12',
          type: 'exam',
          description: 'Periode ujian tengah semester'
        },
        {
          title: 'Ujian Akhir Semester',
          startDate: '2024-06-10',
          endDate: '2024-06-21',
          type: 'exam',
          description: 'Periode ujian akhir semester'
        },
        {
          title: 'Batas Akhir Nilai',
          startDate: '2024-06-28',
          endDate: '2024-06-28',
          type: 'deadline',
          description: 'Batas akhir pengumpulan nilai oleh dosen'
        },
        {
          title: 'Wisuda Periode II',
          startDate: '2024-07-15',
          endDate: '2024-07-15',
          type: 'ceremony',
          description: 'Wisuda periode kedua tahun akademik 2023/2024'
        }
      ]
    }
  ];

  const currentEvents = events.find(p => p.period === selectedPeriod)?.events || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeStyles = (type) => {
    switch (type) {
      case 'registration':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'lecture':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'exam':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deadline':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'ceremony':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Kalender Akademik</h2>
              <p className="text-indigo-100">Jadwal kegiatan akademik</p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6">
          <div className="space-y-6">
            {currentEvents.map((event, index) => (
              <div key={index} className="relative pl-8">
                {/* Timeline line */}
                {index !== currentEvents.length - 1 && (
                  <div className="absolute left-3 top-3 bottom-0 w-px bg-gray-200"></div>
                )}
                
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${getEventTypeStyles(event.type)}`}>
                  <div className={`w-2 h-2 rounded-full ${event.type === 'deadline' ? 'bg-red-500' : 'bg-current'} m-1.5`}></div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeStyles(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {formatDate(event.startDate)}
                      {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalenderAkademik; 