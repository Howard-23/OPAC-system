import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { FieldGroup } from './FieldGroup';
import { useCatalogStore } from '../../stores/catalogStore';
import { Save, PlusSquare, Book, LogOut, Trash2, Eye } from 'lucide-react';

interface EditCatalogDialogProps {
  controlno: string;
  onClose: () => void;
}

export const EditCatalogDialog: React.FC<EditCatalogDialogProps> = ({ controlno, onClose }) => {
  const { fetchFullEntry, updateEntry, fetchHoldings, saveHolding, deleteHolding } = useCatalogStore();
  const [isHoldingsMode, setIsHoldingsMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<any[]>([]);
  
  // Holdings form state
  const [accNo, setAccNo] = useState('');
  const [location, setLocation] = useState('General Collection');
  const [copy, setCopy] = useState('1');

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const loadData = async () => {
      try {
        const entry = await fetchFullEntry(controlno);
        // Map backend fields to form fields
        reset({
          title: entry.title,
          author: entry.author_code.toString(), // Simplified for now, should be author name if joined
          isbn: entry.isbn,
          callno: entry.callno,
          publisher: entry.publisher,
          pubplace: entry.pubplace,
          copyright: entry.copyright,
          physdesc: entry.pagination, // Mapping pagination to physical desc for parity
          edition: entry.edition,
          subject1: entry.subject1_code?.toString(),
          subject2: entry.subject2_code?.toString(),
          subject3: entry.subject3_code?.toString(),
          series: entry.series_title,
          addedtitle: entry.a_entry_title,
          material: entry.material || 'Filipinian',
          notes: entry.x_notes,
        });
        
        const h = await fetchHoldings(controlno);
        setHoldings(h);
      } catch (err) {
        console.error('Failed to load entry:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [controlno, fetchFullEntry, fetchHoldings, reset]);

  const onSaveMetadata = async (data: any) => {
    try {
      await updateEntry({
        controlno,
        title: data.title,
        callno: data.callno,
        author_code: parseInt(data.author) || 0,
        edition: data.edition,
        pagination: data.physdesc,
        publisher: data.publisher,
        pubplace: data.pubplace,
        copyright: data.copyright,
        isbn: data.isbn,
        subject1_code: data.subject1 ? parseInt(data.subject1) : undefined,
        subject2_code: data.subject2 ? parseInt(data.subject2) : undefined,
        subject3_code: data.subject3 ? parseInt(data.subject3) : undefined,
        series_title: data.series,
        a_entry_title: data.addedtitle,
        material: data.material,
        x_notes: data.notes,
      });
      alert('Record updated successfully');
    } catch (err) {
      alert(`Update failed: ${err}`);
    }
  };

  const handleAddHolding = async () => {
    if (!accNo) return;
    try {
      await saveHolding({
        controlno,
        accession: accNo,
        copy,
        location,
        status: 'Available'
      });
      setAccNo('');
      const h = await fetchHoldings(controlno);
      setHoldings(h);
    } catch (err) {
      alert(`Failed to add holding: ${err}`);
    }
  };

  const handleDeleteHolding = async (accession: string) => {
    if (!confirm(`Delete holding ${accession}?`)) return;
    try {
      await deleteHolding(accession);
      const h = await fetchHoldings(controlno);
      setHoldings(h);
    } catch (err) {
      alert(`Delete failed: ${err}`);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-full max-w-5xl h-[90vh] flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
        <TitleBar title="Edit Catalog Record" onClose={onClose} />
        
        {/* Sub-Toolbar (Parity with Wireframe 010) */}
        <div className="flex gap-1 p-1 bg-[#D4D0C8] dark:bg-dark-panel border-b border-white dark:border-dark-highlight shadow-[0_1px_0_#808080] dark:shadow-[0_1px_0_#1A1A1A]">
          <button className="flex flex-col items-center p-1 w-16 hover:bg-gray-200 border border-transparent hover:border-gray-400">
            <PlusSquare size={24} />
            <span className="text-[10px]">Add New</span>
          </button>
          <button onClick={handleSubmit(onSaveMetadata)} className="flex flex-col items-center p-1 w-16 hover:bg-gray-200 border border-transparent hover:border-gray-400">
            <Save size={24} />
            <span className="text-[10px]">Save</span>
          </button>
          <button onClick={() => setIsHoldingsMode(!isHoldingsMode)} className={`flex flex-col items-center p-1 w-16 hover:bg-gray-200 border border-transparent hover:border-gray-400 ${isHoldingsMode ? 'bg-blue-100 border-blue-400' : ''}`}>
            <Book size={24} />
            <span className="text-[10px]">Holdings</span>
          </button>
          <button onClick={onClose} className="flex flex-col items-center p-1 w-16 hover:bg-gray-200 border border-transparent hover:border-gray-400">
            <LogOut size={24} />
            <span className="text-[10px]">Exit</span>
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center px-4 bg-[#000080] text-white italic font-bold">
            infoLib. <span className="text-xs font-normal ml-2">Library Information System</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col gap-4">
          {/* Header Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold dark:text-dark-text">Control No.</span>
              <span className="text-sm font-bold text-[#008000] dark:text-green-400 px-4 py-1 bg-white dark:bg-dark-input border-2 border-inset dark:border-dark-border-dark min-w-[150px]">
                {controlno}
              </span>
            </div>
            {!isHoldingsMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold dark:text-dark-text">Material</span>
                <select {...register('material')} className="bg-white dark:bg-dark-input dark:text-dark-text border-2 border-inset dark:border-dark-border-dark text-sm h-7 px-1 outline-none">
                  <option>Filipinian</option>
                  <option>General Collection</option>
                  <option>Reference</option>
                  <option>Circulation</option>
                </select>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {!isHoldingsMode ? (
              /* Metadata Form (Wireframe 010) */
              <div className="h-full overflow-y-auto pr-2 space-y-3">
                <FieldGroup label="Title" id="title">
                  <textarea {...register('title')} className="input-classic w-full h-16 resize-none" />
                </FieldGroup>
                
                <FieldGroup label="Author" id="author">
                  <input {...register('author')} className="input-classic w-full" />
                </FieldGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="ISBN" id="isbn">
                    <input {...register('isbn')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="Call No." id="callno">
                    <input {...register('callno')} className="input-classic w-full" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Publisher" id="publisher">
                    <input {...register('publisher')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="Pub Place" id="pubplace">
                    <input {...register('pubplace')} className="input-classic w-full" />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Date" id="copyright">
                    <input {...register('copyright')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="Physical Desc" id="physdesc">
                    <input {...register('physdesc')} className="input-classic w-full" />
                  </FieldGroup>
                </div>

                <FieldGroup label="Edition" id="edition">
                  <input {...register('edition')} className="input-classic w-32" />
                </FieldGroup>

                <div className="space-y-1 border-t pt-2 border-gray-300">
                  <FieldGroup label="Subject" id="subject1">
                    <input {...register('subject1')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="" id="subject2">
                    <input {...register('subject2')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="" id="subject3">
                    <input {...register('subject3')} className="input-classic w-full" />
                  </FieldGroup>
                </div>

                <FieldGroup label="Added Entry (T)" id="addedtitle">
                  <input {...register('addedtitle')} className="input-classic w-full" />
                </FieldGroup>

                <FieldGroup label="Series Title" id="series">
                  <input {...register('series')} className="input-classic w-full" />
                </FieldGroup>

                <div className="space-y-1 border-t pt-2 border-gray-300">
                  <FieldGroup label="Added Author" id="aa1">
                    <input {...register('addedauthor1')} className="input-classic w-full" />
                  </FieldGroup>
                  <FieldGroup label="" id="aa2">
                    <input {...register('addedauthor2')} className="input-classic w-full" />
                  </FieldGroup>
                </div>

                <FieldGroup label="Notes" id="notes">
                  <textarea {...register('notes')} className="input-classic w-full h-24 resize-none" />
                </FieldGroup>
              </div>
            ) : (
              /* Holdings Panel (Wireframe 011) */
              <div className="h-full flex flex-col bg-classic-blue text-white p-4 border-2 border-inset border-blue-900 overflow-hidden">
                <div className="flex items-center justify-between border-b border-blue-400 pb-2 mb-4">
                  <h2 className="text-xl font-bold italic">Holdings Management</h2>
                  <div className="flex gap-2">
                    <button onClick={handleAddHolding} className="btn-classic px-4 h-8 text-black">Save</button>
                    <button onClick={() => setIsHoldingsMode(false)} className="btn-classic px-4 h-8 text-black">Cancel</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden">
                  {/* Left: Add/Edit */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold uppercase bg-blue-900 px-1 w-fit">Accession</label>
                      <input 
                        value={accNo} 
                        onChange={(e) => setAccNo(e.target.value)}
                        className="input-classic w-full text-black font-mono font-bold" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold uppercase bg-blue-900 px-1 w-fit">Location</label>
                      <select 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-white dark:bg-dark-input dark:text-dark-text border-2 border-inset dark:border-dark-border-dark text-black text-sm h-8 px-1"
                      >
                        <option>General Collection</option>
                        <option>Filipinian</option>
                        <option>Reference</option>
                        <option>Circulation</option>
                        <option>Reserved</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold uppercase bg-blue-900 px-1 w-fit">Copy No.</label>
                      <input 
                        value={copy}
                        onChange={(e) => setCopy(e.target.value)}
                        className="input-classic w-20 text-black" 
                      />
                    </div>

                    {/* Current Holdings Grid */}
                    <div className="mt-6 flex-1 flex flex-col overflow-hidden">
                      <label className="text-xs font-bold uppercase mb-1">Current Item Copies:</label>
                      <div className="flex-1 bg-white dark:bg-dark-input border-2 border-inset border-blue-900 dark:border-dark-border-dark overflow-y-auto">
                        <table className="w-full text-black dark:text-dark-text text-xs">
                          <thead className="bg-gray-200 dark:bg-dark-surface sticky top-0 border-b dark:border-dark-border-dark">
                            <tr>
                              <th className="text-left p-1 border-r">Accession</th>
                              <th className="text-left p-1 border-r">Location</th>
                              <th className="text-center p-1">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {holdings.map((h, i) => (
                              <tr key={i} className="border-b border-gray-100 dark:border-dark-border-dark hover:bg-blue-50 dark:hover:bg-dark-selection/30">
                                <td className="p-1 font-mono">{h.accession}</td>
                                <td className="p-1">{h.location}</td>
                                <td className="p-1 text-center flex justify-center gap-2">
                                  <button onClick={() => setAccNo(h.accession)} className="text-blue-700 hover:underline"><Eye size={14}/></button>
                                  <button onClick={() => handleDeleteHolding(h.accession)} className="text-red-700 hover:underline"><Trash2 size={14}/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: DELETE (Parity with Wireframe 011) */}
                  <div className="flex flex-col gap-4 border-l border-blue-400 pl-8">
                     <h3 className="text-lg font-bold uppercase text-red-200">Delete Holdings</h3>
                     <p className="text-xs italic opacity-80">To delete an item, enter its accession number or select from the list and click Delete.</p>
                     
                     <div className="flex flex-col gap-1 mt-4">
                        <label className="text-sm font-bold uppercase bg-red-900 px-1 w-fit">Accession</label>
                        <input 
                          value={accNo}
                          onChange={(e) => setAccNo(e.target.value)}
                          className="input-classic w-full text-black font-mono" 
                        />
                     </div>
                     
                     <button 
                       onClick={() => handleDeleteHolding(accNo)}
                       className="btn-classic px-6 h-10 mt-4 bg-red-100 hover:bg-red-200 text-black font-bold border-red-400"
                     >
                       DELETE ITEM
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
