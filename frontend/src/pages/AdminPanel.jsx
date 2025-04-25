import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getReports } from '../services/api';

const AdminPanel = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <p>Manage reports and moderate content.</p>
        </div>
        
        <div className="bg-white shadow rounded-md">
          <ul>
            {reports.map(report => (
              <li key={report.reportId}>
                <div className="px-4 py-5">
                  <h3>Report #{report.reportId}</h3>
                  <p>Status: {report.status}</p>
                  <p>Type: {report.reportType}</p>
                  <p>Details: {report.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;