import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { FieldGroup } from './FieldGroup';

const catalogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  isbn: z.string().optional(),
  callno: z.string().optional(),
  publisher: z.string().optional(),
  pubplace: z.string().optional(),
  date: z.string().optional(),
  physdesc: z.string().optional(),
  edition: z.string().optional(),
  subject1: z.string().optional(),
  subject2: z.string().optional(),
  subject3: z.string().optional(),
  addedtitle: z.string().optional(),
  series: z.string().optional(),
  addedauthor1: z.string().optional(),
  addedauthor2: z.string().optional(),
  addedauthor3: z.string().optional(),
  notes: z.string().optional(),
  material: z.string().default('Book'),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { useCatalogStore } from '../../stores/catalogStore';

export const CatalogForm: React.FC = () => {
  const navigate = useNavigate();
  const [controlNo, setControlNo] = React.useState('');
  const [isHoldingsMode, setIsHoldingsMode] = React.useState(false);
  const createRecord = useCatalogStore((state) => state.createRecord);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
  });

  React.useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = 
      pad(now.getMonth() + 1) + 
      pad(now.getDate()) + 
      now.getFullYear().toString().slice(-2) + 
      pad(now.getHours()) + 
      pad(now.getMinutes()) + 
      pad(now.getSeconds());
    setControlNo(timestamp);
  }, []);

  const onSubmit = async (data: CatalogFormData) => {
    try {
      await createRecord({
        controlno: controlNo,
        ...data,
      });
      alert('Record saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert(`Save failed: ${error}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-classic-grey dark:bg-dark-surface p-2 relative">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <BeveledBox 
          variant="raised" 
          className={`flex-1 flex flex-col p-4 transition-colors duration-200 ${isHoldingsMode ? 'bg-[#0000FF] dark:bg-dark-title' : 'bg-[#E8F0F8] dark:bg-dark-surface-alt'}`}
        >
          {/* Form Header Area */}
          <div className={`flex items-center justify-between mb-4 border-b pb-2 shadow-[0_1px_0_rgba(128,128,128,0.5)] dark:shadow-[0_1px_0_rgba(26,26,26,0.5)] ${isHoldingsMode ? 'border-blue-400 dark:border-dark-highlight' : 'border-white dark:border-dark-highlight'}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isHoldingsMode ? 'text-white' : 'text-black dark:text-dark-text'}`}>Control No.</span>
                <span className="text-sm font-bold text-[#008000] dark:text-green-400 px-2 py-0.5 bg-white dark:bg-dark-input shadow-bevel-sunken min-w-[120px]">
                  {controlNo || 'Generating...'}
                </span>
              </div>
              {!isHoldingsMode && (
                <div className="flex items-center gap-2">
                  <label htmlFor="material-select" className="text-sm font-bold dark:text-dark-text">Material</label>
                  <div className="bg-white dark:bg-dark-input shadow-bevel-sunken px-1">
                    <select 
                      id="material-select" 
                      {...register('material')}
                      className="bg-transparent border-none outline-none text-sm h-6 dark:text-dark-text"
                    >
                      <option>Book</option>
                      <option>Journal</option>
                      <option>CD/DVD</option>
                      <option>Thesis</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className={`text-xl font-bold italic ${isHoldingsMode ? 'text-white' : 'text-classic-blue dark:text-dark-accent'}`}>
              {isHoldingsMode ? 'Holdings Management' : 'Add New'}
            </div>
          </div>

          {isHoldingsMode ? (
            /* Holdings Mode UI (Blue) */
            <div className="flex-1 flex gap-8 p-4 text-white">
              {/* Left Panel: Add/Edit */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold border-b border-blue-400 pb-1">ADD / EDIT Holdings</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">Accession No.</label>
                    <input type="text" className="input-classic w-full text-black" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">Location</label>
                    <div className="bg-white dark:bg-dark-input shadow-bevel-sunken px-1">
                      <select className="w-full bg-transparent border-none outline-none text-sm h-8 text-black dark:text-dark-text">
                        <option>General Collection</option>
                        <option>Reference</option>
                        <option>Reserved</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" className="btn-classic px-4 h-8 text-black">Save Holding</button>
                    <button type="button" className="btn-classic px-4 h-8 text-black">View All</button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-[1px] bg-blue-400 shadow-[1px_0_0_rgba(255,255,255,0.3)]" />

              {/* Right Panel: Delete */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold border-b border-blue-400 pb-1 uppercase">Delete Holdings</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">Accession No. to Delete</label>
                    <input type="text" className="input-classic w-full text-black" />
                  </div>
                  <div className="pt-4">
                    <button type="button" className="btn-classic px-6 h-8 text-black bg-red-100 hover:bg-red-200">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Primary Metadata Section (Normal) */
            <div className="space-y-2 max-w-4xl overflow-auto flex-1">
              <FieldGroup label="Title" id="title">
                <input 
                  id="title" 
                  {...register('title')}
                  className={`input-classic w-full ${errors.title ? 'border-red-500' : ''}`} 
                  type="text" 
                />
                {errors.title && <span className="text-[10px] text-red-600 block">{errors.title.message}</span>}
              </FieldGroup>
              {/* ... existing fields ... */}
              <FieldGroup label="Author" id="author">
                <input id="author" {...register('author')} className="input-classic w-full" type="text" />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="ISBN" id="isbn">
                  <input id="isbn" {...register('isbn')} className="input-classic w-full" type="text" />
                </FieldGroup>
                <FieldGroup label="Call No." id="callno">
                  <input id="callno" {...register('callno')} className="input-classic w-full" type="text" />
                </FieldGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Publisher" id="publisher">
                  <input id="publisher" {...register('publisher')} className="input-classic w-full" type="text" />
                </FieldGroup>
                <FieldGroup label="Pub. Place" id="pubplace">
                  <input id="pubplace" {...register('pubplace')} className="input-classic w-full" type="text" />
                </FieldGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Date" id="date">
                  <input id="date" {...register('date')} className="input-classic w-full" type="text" />
                </FieldGroup>
                <FieldGroup label="Physical Desc" id="physdesc">
                  <input id="physdesc" {...register('physdesc')} className="input-classic w-full" type="text" />
                </FieldGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Edition" id="edition">
                  <input id="edition" {...register('edition')} className="input-classic w-full" type="text" />
                </FieldGroup>
              </div>

              {/* Extended Metadata Section */}
              <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <FieldGroup label="Subject 1" id="subject1">
                    <input id="subject1" {...register('subject1')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                  <FieldGroup label="Subject 2" id="subject2">
                    <input id="subject2" {...register('subject2')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                  <FieldGroup label="Subject 3" id="subject3">
                    <input id="subject3" {...register('subject3')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Added Entry (T)" id="addedtitle">
                    <input id="addedtitle" {...register('addedtitle')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                  <FieldGroup label="Series Title" id="series">
                    <input id="series" {...register('series')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <FieldGroup label="Added Entry (A)" id="addedauthor1">
                    <input id="addedauthor1" {...register('addedauthor1')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                  <FieldGroup label="Added Entry (A)" id="addedauthor2">
                    <input id="addedauthor2" {...register('addedauthor2')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                  <FieldGroup label="Added Entry (A)" id="addedauthor3">
                    <input id="addedauthor3" {...register('addedauthor3')} className="input-classic w-full" type="text" />
                  </FieldGroup>
                </div>

                <FieldGroup label="Notes" id="notes" className="items-start">
                  <textarea 
                    id="notes" 
                    {...register('notes')}
                    className="input-classic w-full h-24 resize-none p-1" 
                    placeholder="Enter annotations..."
                  />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`mt-6 flex justify-end gap-2 border-t pt-4 shadow-[0_-1px_0_rgba(128,128,128,0.5)] dark:shadow-[0_-1px_0_rgba(26,26,26,0.5)] ${isHoldingsMode ? 'border-blue-400 dark:border-dark-highlight' : 'border-white dark:border-dark-highlight'}`}>
            {!isHoldingsMode ? (
              <>
                <button type="submit" className="btn-classic px-6 h-8">Save</button>
                <button type="button" onClick={() => setIsHoldingsMode(true)} className="btn-classic px-6 h-8">Holdings</button>
                <button type="button" onClick={() => navigate('/dashboard')} className="btn-classic px-6 h-8">Exit</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsHoldingsMode(false)} className="btn-classic px-8 h-8 font-bold">Back to Metadata</button>
            )}
          </div>
        </BeveledBox>
      </form>
    </div>
  );
};
