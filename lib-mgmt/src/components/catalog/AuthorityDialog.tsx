import React, { useState, useEffect } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { DataGrid } from '../common/DataGrid';
import { invoke } from '../../lib/runtimeBridge';

interface AuthorityDialogProps {
  onClose: () => void;
}

interface Author {
  author: string;
  author_code: number;
}

interface Subject {
  subject: string;
  subject_code: number;
}

export const AuthorityDialog: React.FC<AuthorityDialogProps> = ({ onClose }) => {
  const [type, setType] = useState<'author' | 'subject'>('author');
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [editValue, setEditValue] = useState('');
  
  const [authors, setAuthors] = useState<Author[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (type === 'author') {
        const data = await invoke<Author[]>('get_authors');
        setAuthors(data);
      } else {
        const data = await invoke<Subject[]>('get_subjects');
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedId(undefined);
    setEditValue('');
  }, [type]);

  const data = type === 'author' 
    ? authors.map(a => ({ id: a.author_code, name: a.author }))
    : subjects.map(s => ({ id: s.subject_code, name: s.subject }));

  const columns = [{ key: 'name', header: type === 'author' ? 'Author Name' : 'Subject Heading', width: '100%' }];

  useEffect(() => {
    const selected = data.find(item => item.id === selectedId);
    if (selected) setEditValue(selected.name);
    else setEditValue('');
  }, [selectedId, data]);

  const handleUpdate = async () => {
    if (!selectedId || !editValue.trim()) return;
    try {
      if (type === 'author') {
        await invoke('update_author', { code: selectedId, name: editValue.trim() });
      } else {
        await invoke('update_subject', { code: selectedId, name: editValue.trim() });
      }
      await loadData();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Update failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Are you sure you want to delete this authority record?')) return;
    
    try {
      if (type === 'author') {
        await invoke('delete_author', { code: selectedId });
      } else {
        await invoke('delete_subject', { code: selectedId });
      }
      setSelectedId(undefined);
      setEditValue('');
      await loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <BeveledBox variant="raised" className="w-full max-w-lg bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col">
        {/* Title Bar */}
        <div className="bg-classic-blue-gradient px-2 py-1 flex items-center justify-between text-white font-bold text-sm">
          <span>Authority Control</span>
          <button onClick={onClose} className="hover:bg-red-500 px-1">✕</button>
        </div>

        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-[400px]">
          {/* Category Toggle */}
          <div className="flex gap-1">
            <button 
              onClick={() => setType('author')}
              className={`btn-classic px-4 h-7 ${type === 'author' ? 'bg-gray-200 dark:bg-dark-surface-alt font-bold' : ''}`}
            >
              Author Authority
            </button>
            <button 
              onClick={() => setType('subject')}
              className={`btn-classic px-4 h-7 ${type === 'subject' ? 'bg-gray-200 dark:bg-dark-surface-alt font-bold' : ''}`}
            >
              Subject Authority
            </button>
          </div>

          {/* System Warning */}
          <div className="text-red-600 dark:text-red-400 font-bold text-center text-xs uppercase leading-tight bg-white/50 dark:bg-dark-input/50 p-2 border border-red-200 dark:border-red-900/50 italic">
            NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[200px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center border-2 border-gray-400 dark:border-dark-border-dark border-t-gray-600 dark:border-t-dark-shadow border-l-gray-600 dark:border-l-dark-shadow bg-white dark:bg-dark-input">
                Loading...
              </div>
            ) : (
              <DataGrid 
                columns={columns} 
                data={data} 
                selectedId={selectedId}
                onRowClick={(row) => setSelectedId(row.id)}
              />
            )}
          </div>

          {/* Edit Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-dark-text">Edit Selected Entry:</label>
            <input 
              type="text" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="input-classic w-full h-8" 
              disabled={!selectedId}
              placeholder={selectedId ? "Edit name..." : "Select an entry to edit"}
            />
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleUpdate} disabled={!selectedId} className="btn-classic px-6 h-8 font-bold disabled:opacity-50">Update</button>
            <button onClick={handleDelete} disabled={!selectedId} className="btn-classic px-6 h-8 text-red-700 disabled:opacity-50">Delete</button>
            <button onClick={onClose} className="btn-classic px-6 h-8">Exit</button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};

