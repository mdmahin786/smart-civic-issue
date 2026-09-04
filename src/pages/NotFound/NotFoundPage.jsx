import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container flex-center flex-direction-column section-padding" style={{ minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ fontSize: '6rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px' }}>404</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '500px', marginBottom: '40px' }}>
        Oops! The page you're looking for doesn't exist or has been moved to another location.
      </p>
      <div className="flex gap-16">
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Go to Home
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-outline">
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
