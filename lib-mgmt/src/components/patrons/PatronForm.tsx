import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { BeveledBox } from '../common/BeveledBox';
import { FieldGroup } from '../catalog/FieldGroup';
import { usePatronStore, Patron } from '../../stores/patronStore';

const patronSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  idno: z.string().min(4, 'ID Number must be at least 4 characters').regex(/^[A-Z0-9-]+$/, 'ID Number can only contain letters, numbers, and dashes'),
  group_name: z.string().min(1, 'Group is required'),
  expiry: z.string().optional().nullable(),
  dept: z.string().optional().nullable(),
  phone: z.string().regex(/^[\d\s-()]*$/, 'Invalid phone format').optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  unpaid_fine: z.coerce.number().min(0, 'Fines cannot be negative').default(0),
});

type PatronFormData = z.infer<typeof patronSchema>;

interface PatronFormProps {
  initialData?: Patron;
  onClose?: () => void;
}

export const PatronForm: React.FC<PatronFormProps> = ({ initialData, onClose }) => {
  const navigate = useNavigate();
  const { addPatron, updatePatron } = usePatronStore();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatronFormData>({
    resolver: zodResolver(patronSchema),
    defaultValues: initialData ? {
      ...initialData,
      expiry: initialData.expiry ? initialData.expiry.split('T')[0] : '',
      dept: initialData.dept ?? '',
      phone: initialData.phone ?? '',
      email: initialData.email ?? '',
    } : {
      group_name: 'STUDENT',
      unpaid_fine: 0,
      expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      dept: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit: SubmitHandler<PatronFormData> = async (data) => {
    const patronData: Patron = {
      ...data,
      email: data.email || null,
      expiry: data.expiry ? new Date(data.expiry).toISOString() : null,
      dept: data.dept || null,
      phone: data.phone || null,
    };

    if (isEdit && initialData) {
      await updatePatron(initialData.idno, patronData);
    } else {
      await addPatron(patronData);
    }
    
    if (onClose) onClose();
    else navigate('/patrons');
  };

  return (
    <div className="flex flex-col h-full bg-classic-grey dark:bg-dark-surface p-2 relative">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col h-full">
        <BeveledBox variant="raised" className="flex-1 flex flex-col p-4 bg-[#E8F0F8] dark:bg-dark-surface-alt">
          <div className="flex items-center justify-between mb-4 border-b border-white dark:border-dark-highlight pb-2 shadow-[0_1px_0_rgba(128,128,128,0.5)] dark:shadow-[0_1px_0_rgba(26,26,26,0.5)]">
            <h2 className="text-xl font-bold italic text-classic-blue dark:text-dark-accent">
              {isEdit ? 'Edit Patron' : 'New Patron Registration'}
            </h2>
          </div>

          <div className="space-y-4 max-w-2xl overflow-auto flex-1">
            <FieldGroup label="Full Name" id="name">
              <input 
                id="name" 
                {...register('name')}
                className={`input-classic w-full ${errors.name ? 'border-red-500' : ''}`} 
                type="text" 
              />
              {errors.name && <span className="text-[10px] text-red-600 block">{errors.name.message}</span>}
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="ID Number" id="idno">
                <input 
                  id="idno" 
                  {...register('idno')} 
                  className={`input-classic w-full ${errors.idno ? 'border-red-500' : ''}`} 
                  type="text" 
                  disabled={isEdit}
                />
              </FieldGroup>
              <FieldGroup label="Group" id="group_name">
                <div className="bg-white dark:bg-dark-input shadow-bevel-sunken px-1">
                  <select 
                    id="group_name" 
                    {...register('group_name')}
                    className="w-full bg-transparent border-none outline-none text-sm h-8 dark:text-dark-text"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="STAFF">STAFF</option>
                    <option value="GUEST">GUEST</option>
                  </select>
                </div>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Department" id="dept">
                <input id="dept" {...register('dept')} className="input-classic w-full" type="text" />
              </FieldGroup>
              <FieldGroup label="Phone" id="phone">
                <input id="phone" {...register('phone')} className="input-classic w-full" type="text" />
              </FieldGroup>
            </div>

            <FieldGroup label="Email Address" id="email">
              <input 
                id="email" 
                {...register('email')} 
                className={`input-classic w-full ${errors.email ? 'border-red-500' : ''}`} 
                type="text" 
              />
              {errors.email && <span className="text-[10px] text-red-600 block">{errors.email.message}</span>}
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Expiry Date" id="expiry">
                <input id="expiry" {...register('expiry')} className="input-classic w-full" type="date" />
              </FieldGroup>
              <FieldGroup label="Unpaid Fine" id="unpaid_fine">
                <input 
                  id="unpaid_fine" 
                  {...register('unpaid_fine')} 
                  className="input-classic w-full" 
                  type="number" 
                />
              </FieldGroup>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-white dark:border-dark-highlight pt-4 shadow-[0_-1px_0_rgba(128,128,128,0.5)] dark:shadow-[0_-1px_0_rgba(26,26,26,0.5)]">
            <button type="submit" className="btn-classic px-8 h-8 font-bold">
              {isEdit ? 'Update' : 'Register'}
            </button>
            <button 
              type="button" 
              onClick={() => onClose ? onClose() : navigate('/patrons')} 
              className="btn-classic px-8 h-8"
            >
              Cancel
            </button>
          </div>
        </BeveledBox>
      </form>
    </div>
  );
};
