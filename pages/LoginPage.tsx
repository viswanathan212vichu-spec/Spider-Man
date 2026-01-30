import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Input } from '../components/UI';
import { Phone, ArrowRight, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (mobile.length !== 10 || isNaN(Number(mobile))) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    const isAdmin = login(mobile, name);
    window.location.hash = isAdmin ? '#/admin' : '#/events';
  };

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
             <p className="text-sm text-slate-500">Verify your mobile number to continue</p>
          </div>

          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Mobile Number"
            type="tel"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={error}
            required
          />

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" icon={ArrowRight}>
            Verify & Continue
          </Button>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 text-center border border-slate-100">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: <span className="font-mono text-indigo-600">9876543210</span></p>
            <p>User: <span className="font-mono text-indigo-600">Any other number</span></p>
          </div>
        </form>
      </Card>
    </div>
  );
};
