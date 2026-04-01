import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Upload, Trash2, Download, FileText, Image, FileArchive, X } from 'lucide-react';
import { attachmentsAPI } from '../services/api';

const MAX_SIZE_MB = 10;

function fileIcon(contentType) {
  if (!contentType) return <FileText className="w-4 h-4" />;
  if (contentType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
  if (contentType === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (contentType.includes('zip')) return <FileArchive className="w-4 h-4 text-yellow-500" />;
  return <FileText className="w-4 h-4 text-gray-500" />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentSection({ executionId }) {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (executionId) load();
  }, [executionId]);

  const load = async () => {
    try {
      const res = await attachmentsAPI.getByExecution(executionId);
      setAttachments(res.data);
    } catch {
      // silently ignore
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      await attachmentsAPI.upload(executionId, file);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const res = await attachmentsAPI.download(attachment.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await attachmentsAPI.delete(id);
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Attachments {attachments.length > 0 && <span className="text-gray-400">({attachments.length})</span>}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <Upload className={`w-4 h-4 shrink-0 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className="text-sm text-gray-500">
          {uploading ? 'Uploading…' : 'Click or drag a file to attach (max 10 MB)'}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
          <X className="w-3 h-3" />
          {error}
        </div>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <ul className="mt-2 space-y-1">
          {attachments.map(att => (
            <li
              key={att.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm group"
            >
              {fileIcon(att.contentType)}
              <span className="flex-1 truncate text-gray-800 font-medium">{att.originalName}</span>
              <span className="text-gray-400 text-xs shrink-0">{formatSize(att.fileSize)}</span>
              <button
                onClick={() => handleDownload(att)}
                className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(att.id)}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
