import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { CheckCircle, XCircle, Loader, Signature, User, Briefcase, Hash, Calendar, Layers } from 'lucide-react';


const VerifySignatureElegant = () => {
 const { token } = useParams();
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);


 useEffect(() => {
 api.get(`/api/verify/signature/${token}/`)
 .then(res => {
 setData(res.data);
 setLoading(false);
 })
 .catch(() => {
 setData({ found: false });
 setLoading(false);
 });
 }, [token]);


 if (loading) {
 return (
 <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
 <div className="relative py-3 sm:max-w-xl sm:mx-auto">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
 <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
 <div className="max-w-md mx-auto">
 <div className="flex items-center justify-center">
 <Loader className="w-12 h-12 text-blue-500 animate-spin" />
 </div>
 <div className="mt-6 text-center">
 <h1 className="text-2xl font-semibold text-gray-700">Memuat Verifikasi</h1>
 <p className="mt-2 text-gray-500">Harap tunggu sebentar...</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }


 if (!data || !data.found) {
 return (
 <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
 <div className="relative py-3 sm:max-w-xl sm:mx-auto">
 <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-red-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
 <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
 <div className="max-w-md mx-auto text-center">
 <XCircle className="w-16 h-16 text-red-500 mx-auto" />
 <div className="mt-6">
 <h1 className="text-2xl font-semibold text-gray-700">Token Tidak Valid</h1>
 <p className="mt-2 text-gray-500">Token tidak ditemukan atau sudah kedaluwarsa.</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }


 const isSigned = data.status === 'signed';


 return (
 <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
 <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
 <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-12">
 <div className="max-w-lg mx-auto">
 <div className="flex items-center justify-center mb-8">
 {isSigned ? (
 <CheckCircle className="w-12 h-12 text-green-500 mr-4" />
 ) : (
 <Signature className="w-12 h-12 text-yellow-500 mr-4" />
 )}
 <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Verifikasi Tanda Tangan</h1>
 </div>
 <div className="divide-y divide-gray-200">
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">Status</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 font-semibold">
 {isSigned ? (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
 <CheckCircle className="w-4 h-4 mr-1" />
 Sudah Ditandatangani
 </span>
 ) : (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
 <Loader className="w-4 h-4 mr-1 animate-spin" />
 Belum Ditandatangani
 </span>
 )}
 </dd>
 </div>
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">Nama</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 text-gray-700">
 <User className="w-4 h-4 inline-block mr-1 align-text-bottom text-indigo-500" />
 {data.nama}
 </dd>
 </div>
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">Jabatan</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 text-gray-700">
 <Briefcase className="w-4 h-4 inline-block mr-1 align-text-bottom text-purple-500" />
 {data.jabatan}
 </dd>
 </div>
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">NIP</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 text-gray-700">
 <Hash className="w-4 h-4 inline-block mr-1 align-text-bottom text-teal-500" />
 {data.nip}
 </dd>
 </div>
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">Waktu</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 text-gray-700">
 <Calendar className="w-4 h-4 inline-block mr-1 align-text-bottom text-orange-500" />
 {data.waktu}
 </dd>
 </div>
 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
 <dt className="text-sm font-medium text-gray-500">Layanan</dt>
 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 text-gray-700">
 <Layers className="w-4 h-4 inline-block mr-1 align-text-bottom text-blue-500" />
 {data.layanan}
 </dd>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};


export default VerifySignatureElegant;