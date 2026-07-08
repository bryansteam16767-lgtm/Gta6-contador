import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<any, State> {
  public props: any;
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-white/5 border border-red-500/30 rounded-3xl p-8 backdrop-blur-2xl text-center shadow-2xl shadow-red-500/10">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-4">System Failure</h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              An unexpected error occurred in the Leonida network. Our technicians are investigating the signal.
            </p>
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl mb-8 text-left">
              <p className="text-[10px] font-mono text-red-400 break-all">
                {this.state.error?.message || 'Unknown Error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              <RefreshCcw size={18} />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
