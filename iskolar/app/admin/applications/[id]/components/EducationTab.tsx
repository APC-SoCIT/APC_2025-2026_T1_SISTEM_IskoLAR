'use client';

import React from 'react';

export interface EducationData {
  currentEducation: {
    school: string;
    program: string;
    yearLevel: string;
    gpa: string;
    academicAwards: string[];
  };
  previousEducation: {
    school: string;
    yearGraduated: string;
    honors?: string[];
  };
  extracurricular: {
    activity: string;
    role: string;
    duration: string;
  }[];
}

export default function EducationTab() {
  // This is a placeholder that we'll enhance later
  const mockData: EducationData = {
    currentEducation: {
      school: 'De La Salle University',
      program: 'Bachelor of Science in Computer Science',
      yearLevel: '3rd Year',
      gpa: '3.8',
      academicAwards: [
        "Dean's Lister (2024-2025)",
        'Academic Excellence Award',
        'Programming Competition Winner'
      ]
    },
    previousEducation: {
      school: 'Manila Science High School',
      yearGraduated: '2023',
      honors: ['Valedictorian', 'Excellence in Mathematics']
    },
    extracurricular: [
      {
        activity: 'Computer Society',
        role: 'Vice President',
        duration: '2024-2025'
      },
      {
        activity: 'Volunteer Teaching Program',
        role: 'Student Mentor',
        duration: '2024-Present'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Educational Background</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review applicant&apos;s academic history and achievements
        </p>
      </div>

      {/* Current Education */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">School</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.school}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Year Level</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.yearLevel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GPA</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.gpa}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Academic Awards</p>
          <ul className="list-disc list-inside space-y-1">
            {mockData.currentEducation.academicAwards.map((award, index) => (
              <li key={index} className="text-gray-700">{award}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Previous Education */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">School</p>
            <p className="font-medium text-gray-900">{mockData.previousEducation.school}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Year Graduated</p>
            <p className="font-medium text-gray-900">{mockData.previousEducation.yearGraduated}</p>
          </div>
        </div>
        {mockData.previousEducation.honors && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Honors & Awards</p>
            <ul className="list-disc list-inside space-y-1">
              {mockData.previousEducation.honors.map((honor, index) => (
                <li key={index} className="text-gray-700">{honor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Extracurricular Activities */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Extracurricular Activities</h3>
        <div className="divide-y divide-gray-200">
          {mockData.extracurricular.map((activity, index) => (
            <div key={index} className="py-4 first:pt-0 last:pb-0">
              <h4 className="font-medium text-gray-900">{activity.activity}</h4>
              <div className="mt-1 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 text-gray-900">{activity.role}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 text-gray-900">{activity.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Verification</h3>
        <div className="space-y-4">
          <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Verify Academic Records
          </button>
          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Request Additional Documents
          </button>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about academic verification..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
