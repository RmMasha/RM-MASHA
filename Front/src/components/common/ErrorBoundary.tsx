'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] flex items-center justify-center p-6">
          <div className="cyber-panel p-8 rounded-2xl max-w-lg w-full text-center border-neon-blue/40 shadow-neon">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-magenta/10 border border-magenta flex items-center justify-center text-magenta shadow-[0_0_20px_rgba(255,0,127,0.3)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-pure tracking-wider uppercase mb-2">
              {this.props.fallbackTitle || 'Módulo Protegido'}
            </h2>
            <p className="text-sm text-ice-blue/80 mb-6 font-mono">
              Esta sección experimentó una interferencia aislada. El resto de la plataforma continúa funcionando al 100%.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-ice-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Reintentar Módulo
              </button>
              <Link
                href="/"
                className="btn-neon-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center"
              >
                Volver al Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

