import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  FileCheck,
  BookOpen,
  Presentation,
  GraduationCap,
  ScrollText,
  Download,
  Upload,
  ClipboardCheck,
  FileSignature,
  CalendarCheck,
  Award,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';

const AdminRoadmap = () => {
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const response = await api.get('/api/skripsi/roadmap/');
      setSteps(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching roadmap steps:', error);
      toast.error('Gagal memuat data roadmap');
      setIsLoading(false);
    }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setIsEditing(true);
  };

  const handleSave = async (updatedStep) => {
    try {
      await api.put(`/api/skripsi/roadmap/${updatedStep.id}/`, updatedStep);
      toast.success('Berhasil memperbarui langkah roadmap');
      fetchSteps();
      setIsEditing(false);
      setEditingStep(null);
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Gagal memperbarui langkah roadmap');
    }
  };

  const handleAddStep = async () => {
    try {
      const newStep = {
        title: 'Langkah Baru',
        description: 'Deskripsi langkah baru',
        status: 'pending',
        order: steps.length + 1
      };
      
      await api.post('/api/skripsi/roadmap/', newStep);
      toast.success('Berhasil menambahkan langkah baru');
      fetchSteps();
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Gagal menambahkan langkah baru');
    }
  };

  const handleDelete = async (stepId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus langkah ini?')) {
      return;
    }

    try {
      await api.delete(`/api/skripsi/roadmap/${stepId}/`);
      toast.success('Berhasil menghapus langkah');
      fetchSteps();
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Gagal menghapus langkah');
    }
  };

  const getStepIcon = (id) => {
    const icons = {
      1: FileText,
      2: Users,
      3: FileCheck,
      4: BookOpen,
      5: Users,
      6: ScrollText,
      7: FileText,
      8: Presentation,
      9: FileSignature,
      10: ClipboardCheck,
      11: CalendarCheck,
      12: Award
    };
    const Icon = icons[id] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Roadmap Skripsi</h1>
          <p className="mt-2 text-gray-600">
            Atur langkah-langkah yang harus dilalui mahasiswa dalam menyelesaikan skripsi
          </p>
        </div>
        <button
          onClick={handleAddStep}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Langkah
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  {getStepIcon(step.id)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {step.id}. {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(step)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(step.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {step.actions && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.actions.map((action, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md"
                        >
                          {action.label}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Langkah Roadmap</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Langkah
                </label>
                <input
                  type="text"
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({...editingStep, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({...editingStep, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingStep.status}
                  onChange={(e) => setEditingStep({...editingStep, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingStep(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => handleSave(editingStep)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoadmap; 