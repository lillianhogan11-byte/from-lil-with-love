import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from './auth';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('token');
    if (token) {
      setToken(token);
      navigate('/portal');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return null;
}
