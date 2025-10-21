import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import React from 'react';

type ModalProps = {
  setActiveModal: (modal: 'none' | 'amount' | 'nextRelease' | 'pending' | 'recipients') => void;
};

const ModalWrapper: React.FC<{ children: React.ReactNode; title: string; subtitle: string; onClose: () => void }> = ({ 
  children, 
  title, 
  subtitle, 
  onClose 
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30" onClick={onClose} />
    <div className="relative z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 md:p-8 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export const AmountDetailsModal = ({ setActiveModal }: ModalProps) => (
  <ModalWrapper 
    title="Scholarship Release Overview" 
    subtitle="Detailed breakdown of releases for current semester" 
    onClose={() => setActiveModal('none')}
  >
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-blue-900">Total Amount: ₱2.5M</h4>
        <p className="text-sm text-blue-600">1st Semester, AY 2025-2026</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Breakdown by Type</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Allowance Release</p>
              <p className="text-sm text-gray-500">250 recipients</p>
            </div>
            <p className="text-lg font-semibold">₱1.25M</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Book Allowance</p>
              <p className="text-sm text-gray-500">200 recipients</p>
            </div>
            <p className="text-lg font-semibold">₱600K</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Tuition Subsidy</p>
              <p className="text-sm text-gray-500">180 recipients</p>
            </div>
            <p className="text-lg font-semibold">₱650K</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => {
            console.log('Downloading report...');
            alert('Report downloaded successfully!');
          }} 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Download Report
        </button>
        <button 
          onClick={() => {
            setActiveModal('none');
            // TODO: Navigate to transactions page
            alert('Navigating to transactions page...');
          }} 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          View All Transactions
        </button>
      </div>
    </div>
  </ModalWrapper>
);

export const NextReleaseModal = ({ setActiveModal }: ModalProps) => (
  <ModalWrapper 
    title="Next Release Details" 
    subtitle="Upcoming release information and requirements" 
    onClose={() => setActiveModal('none')}
  >
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg flex items-start space-x-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <ClockIcon className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h4 className="text-lg font-medium text-yellow-900">Allowance Release</h4>
          <p className="text-yellow-800">Scheduled for Oct 25, 2025 - In 3 days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Time</h4>
          <p className="text-lg font-medium">9:00 AM - 4:00 PM</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Location</h4>
          <p className="text-lg font-medium">Main Auditorium</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Recipients</h4>
          <p className="text-lg font-medium">250 students</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
          <p className="text-lg font-medium">₱1,250,000</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Requirements Checklist</h4>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Staff assignments completed
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Venue booking confirmed
          </li>
          <li className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Student notifications sent
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Schedule Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2">
            <p className="text-sm text-gray-600">9:00 AM - 11:00 AM</p>
            <p className="text-sm font-medium">Block A Students</p>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">11:00 AM - 1:00 PM</p>
            <p className="text-sm font-medium">Block B Students</p>
          </div>
          <div className="flex items-center justify-between p-2">
            <p className="text-sm text-gray-600">2:00 PM - 4:00 PM</p>
            <p className="text-sm font-medium">Block C Students</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => {
            console.log('Downloading checklist...');
            alert('Checklist downloaded successfully!');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Download Checklist
        </button>
        <button 
          onClick={() => {
            console.log('Sending reminders...');
            alert('Reminders sent successfully!');
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Send Reminders
        </button>
      </div>
    </div>
  </ModalWrapper>
);

export const PendingReleasesModal = ({ setActiveModal }: ModalProps) => (
  <ModalWrapper 
    title="Pending Releases" 
    subtitle="Overview of all scheduled releases" 
    onClose={() => setActiveModal('none')}
  >
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-purple-900">5 Releases Pending</h4>
        <p className="text-sm text-purple-600">All releases are on schedule</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">October 25, 2025</h5>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Next up
              </span>
            </div>
            <p className="text-sm text-gray-600">Allowance Release - ₱1.25M total</p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">November 5, 2025</h5>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                14 days away
              </span>
            </div>
            <p className="text-sm text-gray-600">Book Allowance - ₱600K total</p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">November 15, 2025</h5>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                24 days away
              </span>
            </div>
            <p className="text-sm text-gray-600">Allowance Release - ₱1.25M total</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Timeline View</h4>
        <div className="relative">
          <div className="absolute h-full w-px bg-gray-200 left-4"></div>
          <div className="space-y-6 relative">
            {[
              { date: 'Oct 25', event: 'Allowance Release', amount: '₱1.25M' },
              { date: 'Nov 5', event: 'Book Allowance', amount: '₱600K' },
              { date: 'Nov 15', event: 'Allowance Release', amount: '₱1.25M' },
              { date: 'Nov 25', event: 'Book Allowance', amount: '₱600K' },
              { date: 'Dec 5', event: 'Allowance Release', amount: '₱1.25M' },
            ].map((item, index) => (
              <div key={index} className="flex items-start ml-8">
                <div className="absolute left-4 w-2 h-2 bg-blue-600 rounded-full -translate-x-[9px]"></div>
                <div>
                  <p className="font-medium">{item.date}</p>
                  <p className="text-sm text-gray-600">{item.event}</p>
                  <p className="text-sm font-medium text-gray-900">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => {
            console.log('Downloading schedule...');
            alert('Schedule downloaded successfully!');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Download Schedule
        </button>
        <button 
          onClick={() => {
            console.log('Opening calendar view...');
            alert('Opening calendar view...');
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          View Calendar
        </button>
      </div>
    </div>
  </ModalWrapper>
);

export const RecipientsModal = ({ setActiveModal }: ModalProps) => (
  <ModalWrapper 
    title="Recipient Statistics" 
    subtitle="Detailed breakdown of scholarship recipients" 
    onClose={() => setActiveModal('none')}
  >
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-green-900">1,250 Total Recipients</h4>
        <p className="text-sm text-green-600">1st Semester, AY 2025-2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-500 mb-2">By Scholarship Type</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Full Scholarship</span>
              <span className="font-medium">450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Partial Scholarship</span>
              <span className="font-medium">800</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-500 mb-2">By Year Level</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">First Year</span>
              <span className="font-medium">300</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Second Year</span>
              <span className="font-medium">350</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Third Year</span>
              <span className="font-medium">325</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Fourth Year</span>
              <span className="font-medium">275</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">College Distribution</h4>
        <div className="space-y-2">
          {[
            { college: 'School of Computing and Information Technologies', count: 400 },
            { college: 'School of Engineering', count: 350 },
            { college: 'School of Business and Management', count: 300 },
            { college: 'School of Multimedia and Arts', count: 200 },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">{item.college}</p>
              <p className="font-medium">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => {
            console.log('Downloading report...');
            alert('Report downloaded successfully!');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Download Report
        </button>
        <button 
          onClick={() => {
            console.log('Opening full details view...');
            alert('Opening full details view...');
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          View Full Details
        </button>
      </div>
    </div>
  </ModalWrapper>
);