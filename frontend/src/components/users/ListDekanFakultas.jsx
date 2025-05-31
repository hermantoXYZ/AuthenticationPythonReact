import { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const ListDekanFakultas = () => {
  const navigate = useNavigate();
  const [dekanList, setDekanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users with type dekan_fakultas
        const dekanResponse = await api.get('/api/users/', {
          params: { user_type: 'dekan_fakultas' }
        });
        console.log('Dekan list:', dekanResponse.data);
        setDekanList(dekanResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           'Gagal memuat data';
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Dekan Fakultas</h1>
        <p className="text-gray-600">Kelola dan lihat informasi semua Dekan Fakultas</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dekanList.map((dekan) => (
                <tr key={dekan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dekan.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dekan.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dekan.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dekan.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(dekan.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default ListDekanFakultas; 