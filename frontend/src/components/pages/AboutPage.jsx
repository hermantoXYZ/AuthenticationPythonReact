import React from 'react';
import { Info, Users, Award, BookOpen, Building2 } from 'lucide-react';

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tentang Sistem Akademik</h1>
        <p className="text-xl text-gray-600">Platform terpadu untuk manajemen akademik perguruan tinggi</p>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Visi */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Visi</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Menjadi sistem informasi akademik terdepan yang mendukung transformasi digital 
            pendidikan tinggi di Indonesia dengan menyediakan solusi terpadu untuk seluruh 
            stakeholder akademik.
          </p>
        </div>

        {/* Misi */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Misi</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Mengembangkan dan menyediakan platform teknologi informasi yang inovatif, 
            user-friendly, dan terintegrasi untuk mendukung efisiensi dan efektivitas 
            proses akademik.
          </p>
        </div>
      </div>

      {/* Fitur Utama */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Fitur Utama</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manajemen User</h3>
            <p className="text-gray-600">
              Sistem manajemen user yang komprehensif untuk berbagai tipe pengguna akademik.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skripsi Management</h3>
            <p className="text-gray-600">
              Platform lengkap untuk pengelolaan proses skripsi dari pengajuan hingga selesai.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tracer Study</h3>
            <p className="text-gray-600">
              Sistem monitoring dan evaluasi karir alumni melalui tracer study terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Tim Pengembang */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Tim Pengembang</h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Django REST Framework</li>
                <li>• PostgreSQL Database</li>
                <li>• JWT Authentication</li>
                <li>• API Development</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Development</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React.js</li>
                <li>• Tailwind CSS</li>
                <li>• Lucide React Icons</li>
                <li>• Responsive Design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-gray-500">
          © 2024 Sistem Akademik. Dibangun dengan ❤️ untuk pendidikan Indonesia.
        </p>
      </div>
    </div>
  );
}

export default AboutPage; 