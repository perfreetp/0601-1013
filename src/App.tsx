import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Materials from '@/pages/Materials';
import Editor from '@/pages/Editor';
import Templates from '@/pages/Templates';
import Schedule from '@/pages/Schedule';
import Review from '@/pages/Review';
import Analytics from '@/pages/Analytics';
import Members from '@/pages/Members';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/materials" replace />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/review" element={<Review />} />
          <Route path="/reviews" element={<Navigate to="/review" replace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/members" element={<Members />} />
          <Route path="*" element={<Navigate to="/materials" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
