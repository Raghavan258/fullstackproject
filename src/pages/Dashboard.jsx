import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboard from '../components/dashboards/AdminDashboard.jsx';
import CitizenDashboard from '../components/dashboards/CitizenDashboard.jsx';
import EducatorDashboard from '../components/dashboards/EducatorDashboard.jsx';
import LegalExpertDashboard from '../components/dashboards/LegalExpertDashboard.jsx';
import './Dashboard.css';

const ROLE_MAP = {
  admin:        AdminDashboard,
  citizen:      CitizenDashboard,
  student:      CitizenDashboard,
  educator:     EducatorDashboard,
  legal_expert: LegalExpertDashboard,
};

export default function Dashboard() {
  const { user } = useAuth();
  const RoleDash = ROLE_MAP[user?.role];

  if (!RoleDash) {
    return (
      <div className="dashboard-page container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤔</div>
        <h2 style={{ marginBottom: '8px' }}>Unknown Role</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Your account role "{user?.role}" is not recognized. Please contact admin.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page container">
      <RoleDash user={user} />
    </div>
  );
}
