import React from 'react';

// Types
interface VerificationStatus {
  status: string;
  icon: string;
}

interface TimelineItemData {
  title: string;
  date: string;
  status: 'complete' | 'current' | 'pending';
  description: string;
}

interface ApplicantData {
  name: string;
  program: string;
  school: string;
  course: string;
  gpa: string;
  barangay: string;
  submissionDate: string;
  contactNumber: string;
  summary: string;
}

interface ApplicationData {
  verification: {
    residency: VerificationStatus;
    voterStatus: VerificationStatus;
    documents: VerificationStatus;
  };
  applicant: ApplicantData;
  timeline: TimelineItemData[];
}

// Status Card Component
const StatusCard = ({ title, status, icon }: { title: string; status: string; icon: string }) => {
  const styles = {
    verified: 'bg-green-50 border-green-200 text-green-700',
    reupload: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    pending: 'bg-gray-50 border-gray-200 text-gray-700',
  }[status] || 'bg-gray-50 border-gray-200 text-gray-700';

  return (
    <div className={`p-4 rounded-lg border ${styles}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm capitalize">{status}</p>
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem: React.FC<{ item: TimelineItemData }> = ({ item }) => {
  const timelineStyles = React.useMemo(() => ({
    complete: {
      dot: 'bg-green-500 ring-4 ring-green-100',
      icon: (
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      text: 'text-green-700 bg-green-50 border-green-200'
    },
    current: {
      dot: 'bg-blue-500 ring-4 ring-blue-100',
      icon: (
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      text: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    pending: {
      dot: 'bg-yellow-400 ring-4 ring-yellow-100',
      icon: null,
      text: 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }
  } as const), []);

  const styles = timelineStyles[item.status];

  return (
    <div className="flex gap-4 pb-8 group">
      <div className="relative flex items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${styles.dot} 
                        transition-all duration-200 z-10`}>
          {styles.icon}
        </div>
      </div>
      <div className={`flex-1 p-4 rounded-lg border transition-all duration-200 
                      group-hover:shadow-sm ${styles.text}`}>
        <h4 className="font-medium text-gray-900">{item.title}</h4>
        <p className="text-sm text-gray-500 mt-0.5">{item.date}</p>
        <p className="text-sm mt-2">{item.description}</p>
      </div>
    </div>
  );
};

interface OverviewTabProps {
  applicationData: ApplicationData;
  comment: string;
  setComment: (comment: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ applicationData, comment, setComment }) => {
  return (
    <div>
      {/* Applicant Summary */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-medium text-blue-600">
            {applicationData.applicant.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {applicationData.applicant.name}
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {applicationData.applicant.program}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">School & Course:</span>
              <span className="ml-2 text-gray-900">
                {applicationData.applicant.school} – {applicationData.applicant.course}
              </span>
            </div>
            <div>
              <span className="text-gray-500">GPA:</span>
              <span className="ml-2 text-gray-900">{applicationData.applicant.gpa}</span>
            </div>
            <div>
              <span className="text-gray-500">Barangay:</span>
              <span className="ml-2 text-gray-900">{applicationData.applicant.barangay}</span>
            </div>
            <div>
              <span className="text-gray-500">Submission Date:</span>
              <span className="ml-2 text-gray-900">{applicationData.applicant.submissionDate}</span>
            </div>
            <div>
              <span className="text-gray-500">Contact Number:</span>
              <span className="ml-2 text-gray-900">{applicationData.applicant.contactNumber}</span>
            </div>
          </div>
          <p className="text-gray-600">
            {applicationData.applicant.summary}
          </p>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatusCard 
          title="Residency"
          status={applicationData.verification.residency.status}
          icon={applicationData.verification.residency.icon}
        />
        <StatusCard 
          title="Voter Status"
          status={applicationData.verification.voterStatus.status}
          icon={applicationData.verification.voterStatus.icon}
        />
        <StatusCard 
          title="Documents"
          status={applicationData.verification.documents.status}
          icon={applicationData.verification.documents.icon}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Column */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Application Timeline
          </h3>
          <div className="space-y-0 relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {applicationData.timeline.map((item, index) => (
              <TimelineItem key={index} item={item} />
            ))}
          </div>
        </div>

        {/* Actions Column */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verification Actions
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button className="inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white 
                               rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Application
              </button>
              <button className="inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white 
                               rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow
                               focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Deny Application
              </button>
            </div>
            <button className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-yellow-500 text-white 
                             rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-sm hover:shadow
                             focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Request Re-upload
            </button>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add comment with action
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500 bg-white
                         placeholder-gray-400 resize-none transition-all duration-200"
                placeholder="Enter your review comments or additional notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
