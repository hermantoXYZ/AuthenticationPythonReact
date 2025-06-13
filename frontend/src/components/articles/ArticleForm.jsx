import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import { X, Plus, Hash, FileText, Tag, School, Calendar } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programStudi, setProgramStudi] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'akademik',
    tags: '',
    status: 'draft',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    related_prodi: ''
  });

  useEffect(() => {
    fetchProgramStudi();
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchProgramStudi = async () => {
    try {
      const response = await api.get('/api/prodi/');
      setProgramStudi(response.data);
      setIsLoading(false);
    } catch (error) {
      toast.error('Gagal memuat data program studi');
      setIsLoading(false);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/api/articles/${id}/`);
      const article = response.data;
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        status: article.status,
        is_featured: article.is_featured,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        related_prodi: article.related_prodi || '',
      });
    } catch (error) {
      toast.error('Gagal memuat artikel');
      navigate('/dashboard/articles');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = {
        title: 'Judul',
        excerpt: 'Ringkasan',
        content: 'Konten',
        category: 'Kategori',
        status: 'Status'
      };

      // Check for empty required fields
      const emptyFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([_, label]) => label);

      if (emptyFields.length > 0) {
        toast.error(`Field berikut harus diisi: ${emptyFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      if (id) {
        await api.put(`/api/articles/${id}/`, formData);
        toast.success('Artikel berhasil diperbarui');
      } else {
        await api.post('/api/articles/', formData);
        toast.success('Artikel berhasil dibuat');
      }
      navigate('/dashboard/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error(error.response?.data?.detail || 'Gagal membuat artikel');
    } finally {
      setIsSubmitting(false);
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {id ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          </h1>
          <p className="text-gray-600">Buat artikel baru untuk website FEB UNM</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul artikel"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ringkasan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan ringkasan artikel"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten <span className="text-red-500">*</span>
                </label>
                <Editor
                  apiKey="17500otq8xaigsm2ycdwhypuyn5wrwkxm4jhuubwc1wf9hlm"
                  value={formData.content}
                  onEditorChange={(content) => handleInputChange('content', content)}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                  }}
                />
              </div>
            </div>

            {/* Sidebar - Right Side (1 Column) */}
            <div className="space-y-6">
              {/* Status & Category Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Kategori</h3>
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="akademik">Akademik</option>
                      <option value="event">Event</option>
                      <option value="prestasi">Prestasi</option>
                      <option value="pengumuman">Pengumuman</option>
                    </select>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                      Tampilkan sebagai artikel unggulan
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags & Program Studi Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags & Program Studi</h3>
                <div className="space-y-4">
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pisahkan dengan koma"
                    />
                  </div>

                  {/* Program Studi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Studi Terkait
                    </label>
                    <select
                      value={formData.related_prodi}
                      onChange={(e) => handleInputChange('related_prodi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Program Studi</option>
                      {programStudi.map((prodi) => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SEO Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
                <div className="space-y-4">
                  {/* Meta Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO title"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO description"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/articles')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : id ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default ArticleForm; 