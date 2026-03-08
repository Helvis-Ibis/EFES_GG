// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ProtectedRoute({ children, requiredRole }) {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      const userRole = localStorage.getItem('user_role');

      if (!sessionToken || !userRole) {
        navigate('/LoginSecretaire');
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        navigate('/LoginSecretaire');
        return;
      }

      try {
        const response = await fetch(URL_BASE.VERIFY_SESSION(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_token: sessionToken })
        });

        const data = await response.json();

        if (data.success) {
          setIsVerified(true);
        } else {
          localStorage.removeItem('session_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_role');
          navigate('/LoginSecretaire');
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
        navigate('/LoginSecretaire');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isVerified ? children : null;
}