'use client';

import React, { useState } from 'react';

export interface EducationData {
  currentEducation: {
    school: string;
    program: string;
    yearLevel: string;
    gpa: string;
    semestersCompleted: number;
    scholarshipHistory: string;
  };
  academicPerformance: {
    semester: string;
    gpa: string;
  }[];
  previousEducation: {
    level: string;
    years: string;
    school: string;
    strand?: string;
    track?: string;
    grade: string;
    awards: string;
  }[];
}

export default function EducationTab() {
  const mockData = {
    currentEducation: {
      school: 'Technological Institute of the Philippines (TIP Manila)',
      program: 'BS Computer Science',
      yearLevel: '3rd Year',
      gpa: '1.80',
      semestersCompleted: 5,
      scholarshipHistory: 'New Applicant'
    },
    academicPerformance: [
      { semester: '1st Year - 1st Semester (2021-2022)', gpa: '1.50' },
      { semester: '1st Year - 2nd Semester (2021-2022)', gpa: '1.75' },
      { semester: '2nd Year - 1st Semester (2022-2023)', gpa: '1.75' },
      { semester: '2nd Year - 2nd Semester (2022-2023)', gpa: '2.00' },
      { semester: '3rd Year - 1st Semester (2023-2024)', gpa: '2.00' }
    ],
    previousEducation: [
      {
        level: 'Senior High School',
        years: '2019 - 2021',
        school: 'Taguig Science High School',
        strand: 'STEM (Science, Technology, Engineering, Mathematics)',
        grade: '92.5%',
        awards: 'With Honors'
      },
      {
        level: 'Junior High School',
        years: '2015 - 2019',
        school: 'Taguig National High School',
        track: 'Regular',
        grade: '90.2%',
        awards: 'With Honors'
      }
    ]
  };

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Current Education */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            GPA Below Threshold
          </span>
          <p className="text-sm text-yellow-700 mt-2">
            The minimum required GPA for this scholarship is 1.75. Applicant&apos;s current GPA is 1.80.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current School</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.school}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Degree Program</p>
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
          <div>
            <p className="text-sm text-gray-500">Semesters Completed</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.semestersCompleted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Scholarship History</p>
            <p className="font-medium text-gray-900">{mockData.currentEducation.scholarshipHistory}</p>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Performance</h3>
        <button
          className="text-blue-600 hover:underline mb-4"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen ? 'Hide Details' : 'Show Details'}
        </button>
        {isDropdownOpen && (
          <div className="space-y-4">
            {mockData.academicPerformance.map((performance, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900">{performance.semester}</p>
                <p className="text-sm text-gray-900">GPA: {performance.gpa}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Education */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Education</h3>
        <div className="space-y-4">
          {mockData.previousEducation.map((education, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{education.level}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                  Verified
                </span>
              </div>
              <p className="font-medium text-gray-900">{education.school}</p>
              <p className="text-sm text-gray-500">{education.years}</p>
              {education.strand && <p className="text-sm text-gray-500">Strand: {education.strand}</p>}
              {education.track && <p className="text-sm text-gray-500">Track: {education.track}</p>}
              <p className="text-sm text-gray-500">Grade: {education.grade}</p>
              <p className="text-sm text-gray-500">Awards: {education.awards}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
