'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Release } from '@/lib/types/release';

const barangayData = [
    { name: "Ayala-Paseo de Roxas", zipCode: "1226" },
    { name: "Bangkal", zipCode: "1233" },
    { name: "Bel-Air", zipCode: "1209" },
    { name: "Cembo", zipCode: "1214" },
    { name: "Comembo", zipCode: "1217" },
    { name: "Dasmarinas Village North", zipCode: "1221" },
    { name: "Dasmarinas Village South", zipCode: "1222" },
    { name: "Forbes Park North", zipCode: "1219" },
    { name: "Forbes Park South", zipCode: "1220" },
    { name: "Fort Bonifacio Naval Station", zipCode: "1202" },
    { name: "Greenbelt", zipCode: "1228" },
    { name: "Guadalupe Nuevo", zipCode: "1212" },
    { name: "Guadalupe Viejo", zipCode: "1211" },
    { name: "Kasilawan", zipCode: "1206" },
    { name: "La Paz Singkamas Tejeros", zipCode: "1204" },
    { name: "Legaspi Village", zipCode: "1229" },
    { name: "Magallanes Village", zipCode: "1232" },
    { name: "Makati Commercial Center", zipCode: "1224" },
    { name: "Makati CPO Inc. Buendia", zipCode: "1200" },
    { name: "Olympia and Carmona", zipCode: "1207" },
    { name: "Palanan", zipCode: "1235" },
    { name: "Pasong Tamo, Ecology Village", zipCode: "1231" },
    { name: "Pembo", zipCode: "1218" },
    { name: "Pinagkaisahan-Pitogo", zipCode: "1213" },
    { name: "Pio del Pilar", zipCode: "1230" },
    { name: "Poblacion", zipCode: "1210" },
    { name: "Rembo (East)", zipCode: "1216" },
    { name: "Rembo (West)", zipCode: "1215" },
    { name: "Salcedo Village", zipCode: "1227" },
    { name: "San Antonio Village", zipCode: "1203" },
    { name: "San Isidro", zipCode: "1234" },
    { name: "San Lorenzo Village", zipCode: "1223" },
    { name: "Sta. Cruz", zipCode: "1205" },
    { name: "Urdaneta Village", zipCode: "1225" },
    { name: "Valenzuela, Santiago, Rizal", zipCode: "1208" }
];

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  release?: Release;
  semesterId?: string;
}

export default function ScheduleReleaseModal({ onClose, onSuccess, release, semesterId }: Props) {
  const [formData, setFormData] = useState({
    releasetype: '',
    releasedate: '',
    releasetime: '',
    barangay: '',
    location: '',
    amountperstudent: '',
    numberofrecipients: '',
    additionalnotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (release) {
      setFormData({
        releasetype: release.releasetype,
        releasedate: release.releasedate,
        releasetime: release.releasetime,
        barangay: release.barangay || '',
        location: release.location || '',
        amountperstudent: release.amountperstudent.toString(),
        numberofrecipients: release.numberofrecipients.toString(),
        additionalnotes: release.additionalnotes || ''
      });
    }
  }, [release]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch(release ? `/api/releases/${release.releaseid}` : '/api/releases', {
        method: release ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountperstudent: parseFloat(formData.amountperstudent),
          numberofrecipients: parseInt(formData.numberofrecipients),
          barangay: formData.barangay || null,
          location: formData.location || null,
          additionalnotes: formData.additionalnotes || null,
          semester_id: semesterId || release?.semester_id
        })
      });
      
      if (!response.ok) throw new Error('Failed to save release');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving release:', error);
      alert('Failed to save release');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              {release ? 'Edit Release' : 'Schedule New Release'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="releasetype" className="block text-sm font-medium text-gray-700 mb-1">
                Release Type*
              </label>
              <select
                id="releasetype"
                required
                value={formData.releasetype}
                onChange={e => setFormData(prev => ({ ...prev, releasetype: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="Allowance">Allowance</option>
                <option value="Book Allowance">Book Allowance</option>
                <option value="Tuition">Tuition</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="releasedate" className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date*
                </label>
                <input
                  type="date"
                  id="releasedate"
                  required
                  value={formData.releasedate}
                  onChange={e => setFormData(prev => ({ ...prev, releasedate: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="releasetime" className="block text-sm font-medium text-gray-700 mb-1">
                  Release Time*
                </label>
                <input
                  type="time"
                  id="releasetime"
                  required
                  value={formData.releasetime}
                  onChange={e => setFormData(prev => ({ ...prev, releasetime: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
                  Barangay
                </label>
                <select
                  id="barangay"
                  value={formData.barangay}
                  onChange={e => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Select Barangay</option>
                  {barangayData.map((brgy) => (
                    <option key={brgy.zipCode} value={brgy.name}>
                      {brgy.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-[60%] -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amountperstudent" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount per Student*
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="number"
                    id="amountperstudent"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amountperstudent}
                    onChange={e => setFormData(prev => ({ ...prev, amountperstudent: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="numberofrecipients" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Recipients*
                </label>
                <input
                  type="number"
                  id="numberofrecipients"
                  required
                  min="1"
                  value={formData.numberofrecipients}
                  onChange={e => setFormData(prev => ({ ...prev, numberofrecipients: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="additionalnotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="additionalnotes"
                rows={3}
                value={formData.additionalnotes}
                onChange={e => setFormData(prev => ({ ...prev, additionalnotes: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Release'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}