import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.group('🔥 CandidateIQ Runtime Exception Caught by ErrorBoundary');
    console.error('Title:', this.props.title || 'Component Error');
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-8 saas-card bg-white border border-rose-200 text-slate-800 shadow-md space-y-4 text-center rounded-2xl select-none">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-outfit text-slate-900">
              {this.props.title || 'Unable to load module content'}
            </h3>
            <p className="text-xs text-slate-500">
              An unexpected error occurred while rendering this section. CandidateIQ safe-guard prevented a full screen crash.
            </p>
          </div>

          {/* Dev Debug Details Toggle */}
          {this.state.error && (
            <div className="text-left bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto space-y-2 border border-slate-800">
              <div
                className="flex items-center justify-between cursor-pointer select-none border-b border-slate-800 pb-2 text-rose-400 font-bold"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              >
                <span className="flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-rose-400" /> Runtime Error: {this.state.error.message}
                </span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {this.state.showDetails && (
                <div className="space-y-2 pt-2 text-[11px] leading-relaxed text-slate-300">
                  <div>
                    <strong className="text-amber-400 uppercase text-[10px] block">Error Stack:</strong>
                    <pre className="whitespace-pre-wrap text-rose-300 mt-1 max-h-40 overflow-y-auto font-mono text-[10px]">
                      {this.state.error.stack}
                    </pre>
                  </div>

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-amber-400 uppercase text-[10px] block">Component Trace Stack:</strong>
                      <pre className="whitespace-pre-wrap text-indigo-300 mt-1 max-h-40 overflow-y-auto font-mono text-[10px]">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="btn-primary px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset View & Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
