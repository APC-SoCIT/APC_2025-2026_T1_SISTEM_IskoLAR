"use client";

import { useState } from "react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Scholarship Applications Now Open",
      date: "September 15, 2025",
      description:
        "We are now accepting applications for the 2025–2026 academic year. Submit your application before October 20, 2025.",
    },
    {
      id: 2,
      title: "Orientation Schedule",
      date: "August 5, 2025",
      description:
        "All new scholars are invited to attend the orientation program. Details will be sent via email.",
    },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.date) return;

    const newItem = {
      id: announcements.length + 1,
      ...newAnnouncement,
    };

    setAnnouncements([newItem, ...announcements]);
    setNewAnnouncement({ title: "", date: "", description: "" });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin – Announcements</h1>
      <p className="text-gray-600 mb-6">
        Manage and create announcements for scholars here.
      </p>

      {/* New Announcement Form */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            type="date"
            value={newAnnouncement.date}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, date: e.target.value })
            }
            className="w-full border rounded-lg p-2"
            required
          />
          <textarea
            placeholder="Description"
            value={newAnnouncement.description}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                description: e.target.value,
              })
            }
            className="w-full border rounded-lg p-2"
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Post Announcement
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white shadow rounded-2xl p-5 border hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {announcement.title}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{announcement.date}</p>
            <p className="text-gray-700 mb-4">{announcement.description}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                Edit
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
