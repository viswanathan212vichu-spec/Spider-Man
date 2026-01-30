import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/UI';
import { Mail, ArrowRight, Shield, Lock } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loading: authLoading, userData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && userData) {
      const destination = userData.role === 'ADMIN' ? '/admin' : '/events';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, authLoading, userData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await login(email, password);

      // Fetch user role to determine redirect
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const role = userDoc.data()?.role || 'USER';

      // Role-based redirect
      const destination = role === 'ADMIN' ? '/admin' : '/events';
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setLoading(false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-3">GalaPass</h1>
        <p className="text-slate-600 max-w-md mx-auto text-lg">
          The premium platform for exclusive events.
        </p>
      </div>

      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-indigo-600">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Enter your credentials to continue</p>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            icon={Mail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
            icon={Lock}
          />

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
            icon={ArrowRight}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};
