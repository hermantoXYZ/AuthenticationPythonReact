import { useState } from 'react';
import { BookOpen, Download, Search, ChevronRight, FileText, Book } from 'lucide-react';

const PanduanAkademik = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua', icon: BookOpen },
    { id: 'akademik', label: 'Akademik', icon: Book },
    { id: 'skripsi', label: 'Skripsi', icon: FileText },
    { id: 'wisuda', label: 'Wisuda', icon: BookOpen }
  ];

  const documents = [
    {
      id: 1,
      title: 'Panduan Akademik 2023/2024',
      description: 'Panduan lengkap mengenai peraturan dan kebijakan akademik',
      category: 'akademik',
      fileSize: '2.5 MB',
      lastUpdated: '2024-01-15',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Pedoman Penulisan Skripsi',
      description: 'Panduan format dan tata cara penulisan skripsi',
      category: 'skripsi',
      fileSize: '1.8 MB',
      lastUpdated: '2024-02-01',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Prosedur Wisuda',
      description: 'Tata cara dan persyaratan wisuda',
      category: 'wisuda',
      fileSize: '1.2 MB',
      lastUpdated: '2024-03-10',
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Panduan Bimbingan Akademik',
      description: 'Prosedur dan ketentuan bimbingan akademik',
      category: 'akademik',
      fileSize: '1.5 MB',
      lastUpdated: '2024-02-20',
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Template Dokumen Skripsi',
      description: 'Format template untuk penulisan skripsi',
      category: 'skripsi',
      fileSize: '500 KB',
      lastUpdated: '2024-01-25',
      downloadUrl: '#'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Panduan Akademik</h2>
              <p className="text-purple-100">Dokumen panduan dan pedoman akademik</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="border-b border-gray-200">
          <div className="p-4 grid gap-4 md:grid-cols-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="divide-y divide-gray-200">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${doc.category === 'akademik' ? 'bg-blue-100 text-blue-700' :
                        doc.category === 'skripsi' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'}`}
                    >
                      {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Diperbarui: {formatDate(doc.lastUpdated)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {doc.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{doc.fileSize}</span>
                  </div>
                </div>
                <a
                  href={doc.downloadUrl}
                  className="ml-4 flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Unduh</span>
                </a>
              </div>
            </div>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tidak ada dokumen</h3>
              <p className="mt-2 text-gray-500">
                Tidak ditemukan dokumen yang sesuai dengan pencarian Anda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanduanAkademik; 