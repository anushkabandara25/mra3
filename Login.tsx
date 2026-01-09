
import React, { useState, useEffect, useRef } from 'react';
import { Role } from '../types';
import { Lock, User as UserIcon, Zap, AlertCircle } from 'lucide-react';

// Declare google as a global variable
declare const google: any;

interface LoginProps {
  onLogin: (username: string, role: Role, name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const pollingInterval = useRef<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin('admin', 'admin', 'M.R.A Owner');
    } else if (username === 'staff' && password === 'staff') {
      onLogin('staff', 'staff', 'Sales Assistant');
    } else {
      alert('Invalid credentials! Hint: use admin/admin or staff/staff');
    }
  };

  const handleGoogleResponse = (response: any) => {
    try {
      if (!response || !response.credential) {
        throw new Error("No credential received from Google");
      }
      const payload = decodeJwt(response.credential);
      if (payload) {
        onLogin(payload.email || 'google_user', 'admin', payload.name || payload.email || 'Google User');
      } else {
        throw new Error("Failed to decode payload");
      }
    } catch (err) {
      console.error("Google response error:", err);
      alert("Google Sign-In failed. Please try manual login.");
    }
  };

  const decodeJwt = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode error:", e);
      return null;
    }
  };

  const initGoogleSignIn = () => {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try {
        google.accounts.id.initialize({
          client_id: '1013495034680-q58q760a0g6j88b0a9o0k1i3f4v6h3b0.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          auto_select: false,
          itp_support: true
        });
        
        const btnParent = document.getElementById("googleSignInBtn");
        if (btnParent) {
          google.accounts.id.renderButton(
            btnParent,
            { theme: "outline", size: "large", width: 320, text: "signin_with", shape: "pill" }
          );
          setGoogleLoaded(true);
          if (pollingInterval.current) {
            window.clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }
        }
      } catch (err) {
        console.error("GIS Init error:", err);
        setGoogleError(true);
      }
    }
  };

  useEffect(() => {
    initGoogleSignIn();

    pollingInterval.current = window.setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        initGoogleSignIn();
      }
    }, 500);

    const timeout = window.setTimeout(() => {
      if (typeof google === 'undefined') {
        setGoogleError(true);
        if (pollingInterval.current) {
          window.clearInterval(pollingInterval.current);
        }
      }
    }, 8000);

    return () => {
      if (pollingInterval.current) window.clearInterval(pollingInterval.current);
      window.clearTimeout(timeout);
    };
  }, []);

  const simulateGoogleLogin = () => {
    onLogin('admin@mra-electricals.com', 'admin', 'M.R.A Admin (Simulated)');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-blue-900 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={100} />
          </div>
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-500">
            <Zap size={32} />
          </div>
          <h1 className="text-2xl font-bold">M.R.A AUTO ELECTRICALS</h1>
          <p className="text-blue-300 text-sm mt-1 uppercase tracking-widest">Inventory Management</p>
        </div>
        
        <div className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="admin or staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div id="googleSignInBtn" className="min-h-[44px] flex justify-center w-full">
              {!googleLoaded && !googleError && (
                <div className="animate-pulse bg-slate-100 rounded-full h-11 w-full max-w-[320px]"></div>
              )}
            </div>
            
            {(googleError || !googleLoaded) && (
              <button 
                onClick={simulateGoogleLogin}
                className="flex items-center justify-center space-x-2 w-full max-w-[320px] py-2.5 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 opacity-70" alt="Google" />
                <span>Bypass Google Sign-In</span>
              </button>
            )}
            
            {googleError && (
              <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-[10px]">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <p>Authentication script blocked. Use the bypass or manual login (admin/admin).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
