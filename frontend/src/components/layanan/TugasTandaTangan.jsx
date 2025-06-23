import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../api';
import { Loader2, FileText, CheckCircle2, AlertTriangle, User, Calendar, Edit } from 'lucide-react';

const TugasTandaTangan = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [signingId, setSigningId] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/tanda-tangan-surat/tugas-saya/');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching signature tasks:', error);
            toast.error('Gagal memuat tugas tanda tangan.');
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async (taskId) => {
        setSigningId(taskId);
        try {
            await api.post(`/api/tanda-tangan-surat/${taskId}/tandatangani/`);
            toast.success('Dokumen berhasil ditandatangani.');
            fetchTasks(); // Refresh the list
        } catch (error) {
            console.error('Error signing document:', error);
            toast.error(error.response?.data?.detail || 'Gagal menandatangani dokumen.');
        } finally {
            setSigningId(null);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tugas Tanda Tangan Saya</h1>
                <p className="mt-2 text-gray-600">Daftar dokumen yang memerlukan tanda tangan Anda.</p>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak Ada Tugas</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Anda tidak memiliki dokumen yang perlu ditandatangani saat ini.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <li key={task.id} className="p-6 hover:bg-gray-50">
                                <div className="flex flex-col sm:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{task.surat?.perihal || 'Informasi Surat Tidak Tersedia'}</p>
                                                <p className="text-sm text-gray-600">
                                                    No. <span className="font-medium">{task.surat?.full_nomor || '-'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>Jabatan: <span className="font-medium text-gray-800">{task.jabatan_penandatangan}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Tanggal Surat: <span className="font-medium text-gray-800">{formatDate(task.surat?.tanggal_dibuat)}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() => handleSign(task.id)}
                                            disabled={signingId === task.id}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {signingId === task.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Edit className="w-4 h-4" />
                                            )}
                                            Tandatangani
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TugasTandaTangan; 