'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  FileSpreadsheet, 
  File as FileIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface KPI {
  id: string;
  name: string;
  target: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  date?: string;
  budget: number;
  kpis: KPI[];
}

interface KPIResult {
  kpiId: string;
  achievedValue: string;
  notes: string;
}

export default function SubmitWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [summary, setSummary] = useState('');
  const [kpiResults, setKpiResults] = useState<KPIResult[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // File type configuration
  const ACCEPTED_FILE_TYPES = {
    // Documents
    'application/pdf': { ext: '.pdf', icon: FileText, color: 'text-red-500' },
    'application/msword': { ext: '.doc', icon: FileText, color: 'text-blue-500' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: FileText, color: 'text-blue-500' },
    
    // Spreadsheets
    'text/csv': { ext: '.csv', icon: FileSpreadsheet, color: 'text-green-500' },
    'application/json': { ext: '.json', icon: FileText, color: 'text-yellow-500' },
    'application/vnd.ms-excel': { ext: '.xls', icon: FileSpreadsheet, color: 'text-green-500' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', icon: FileSpreadsheet, color: 'text-green-500' },
    
    // Images
    'image/jpeg': { ext: '.jpg', icon: ImageIcon, color: 'text-purple-500' },
    'image/png': { ext: '.png', icon: ImageIcon, color: 'text-purple-500' },
    'image/gif': { ext: '.gif', icon: ImageIcon, color: 'text-purple-500' },
    'image/webp': { ext: '.webp', icon: ImageIcon, color: 'text-purple-500' },
    'image/svg+xml': { ext: '.svg', icon: ImageIcon, color: 'text-purple-500' },
    
    // Videos
    'video/mp4': { ext: '.mp4', icon: Film, color: 'text-pink-500' },
    'video/quicktime': { ext: '.mov', icon: Film, color: 'text-pink-500' },
    'video/x-msvideo': { ext: '.avi', icon: Film, color: 'text-pink-500' },
    
    // Text
    'text/plain': { ext: '.txt', icon: FileText, color: 'text-gray-500' },
    'text/markdown': { ext: '.md', icon: FileText, color: 'text-gray-500' },
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILES = 10;

  const getFileIcon = (file: File) => {
    const fileType = ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES];
    if (fileType) {
      return { Icon: fileType.icon, color: fileType.color };
    }
    return { Icon: FileIcon, color: 'text-gray-500' };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit`;
    }
    if (!ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]) {
      return `File type not supported: ${file.type}`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitting(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        toast.error('User email not found');
        return;
      }

      const formData = new FormData();
      formData.append('taskId', id);
      formData.append('builderEmail', userEmail);
      formData.append('summary', summary);
      formData.append('status', isDraft ? 'draft' : 'submitted');
      formData.append('kpiResults', JSON.stringify(kpiResults));

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success(isDraft ? 'Saved as draft!' : 'Submitted for review!');
        router.push('/builder/my-tasks');
      } else {
        toast.error('Failed to submit work');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      toast.error('Error submitting work');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);

          // Initialize KPI results
          if (data.kpis) {
            setKpiResults(
              data.kpis.map((kpi: KPI) => ({
                kpiId: kpi.id,
                achievedValue: '',
                notes: '',
              })),
            );
          }
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleKpiChange = (index: number, field: 'achievedValue' | 'notes', value: string) => {
    const updated = [...kpiResults];
    updated[index][field] = value;
    setKpiResults(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Task not found</p>
        <Link href="/builder/my-tasks">
          <button className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to My Tasks
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/builder/my-tasks">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-500 mt-1">Submit your work</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
          ${task.budget.toLocaleString()}
        </span>
      </div>

      {/* Submission Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="space-y-8">
          {/* Summary of Work */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Summary</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary of Work Completed
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a detailed summary of the event, what you accomplished, and any notable highlights..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-2">
              Include details about the event execution, audience engagement, and overall outcomes.
            </p>
          </div>

          {/* KPI Results */}
          {task.kpis && task.kpis.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">KPI Results</h3>
              <div className="space-y-6">
                {task.kpis.map((kpi, index) => (
                  <div key={kpi.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900">{kpi.name}</p>
                      <p className="text-sm text-gray-500">Target: {kpi.target}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Achieved Value
                        </label>
                        <input
                          type="text"
                          value={kpiResults[index]?.achievedValue || ''}
                          onChange={(e) => handleKpiChange(index, 'achievedValue', e.target.value)}
                          placeholder="e.g., 65"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={kpiResults[index]?.notes || ''}
                          onChange={(e) => handleKpiChange(index, 'notes', e.target.value)}
                          placeholder="Additional context..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Files */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Supporting Files</h3>
            
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
              <p className="text-gray-700 font-medium mb-2">
                {isDragging ? 'Drop files here' : 'Upload Files'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
              />
              <label htmlFor="file-upload">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer">
                  Choose Files
                </span>
              </label>
            </div>

            {/* Supported File Types */}
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Supported file types:</p>
                  <p className="text-xs text-blue-700">
                    <strong>Documents:</strong> PDF, DOC, DOCX, TXT, MD<br />
                    <strong>Spreadsheets:</strong> CSV, JSON, XLS, XLSX<br />
                    <strong>Images:</strong> JPG, PNG, GIF, WEBP, SVG<br />
                    <strong>Videos:</strong> MP4, MOV, AVI<br />
                    <strong>Max size:</strong> 50MB per file | <strong>Max files:</strong> {MAX_FILES}
                  </p>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {files.length} file(s) selected
                  </p>
                  <button
                    onClick={() => {
                      setFiles([]);
                      toast.success('All files removed');
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove All
                  </button>
                </div>
                {files.map((file, index) => {
                  const { Icon, color } = getFileIcon(file);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting || !summary.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
