import React from 'react';

export default function AssessmentSkeleton() {
  return (
    <div className="mcq-app-canvas min-h-screen p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl p-4 border border-[#E4E7EC] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAECF0]" />
          <div className="space-y-2">
            <div className="w-32 h-3 bg-[#EAECF0] rounded" />
            <div className="w-48 h-4 bg-[#EAECF0] rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 bg-[#EAECF0] rounded-lg" />
          <div className="w-32 h-8 bg-[#EAECF0] rounded-lg" />
        </div>
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigator Skeleton */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-[#E4E7EC] space-y-4">
          <div className="w-24 h-4 bg-[#EAECF0] rounded" />
          <div className="w-full h-2 bg-[#EAECF0] rounded-full" />
          <div className="grid grid-cols-4 gap-2 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#EAECF0] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Center Question Skeleton */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] space-y-4">
            <div className="w-40 h-4 bg-[#EAECF0] rounded" />
            <div className="w-full h-6 bg-[#EAECF0] rounded" />
            <div className="w-4/5 h-6 bg-[#EAECF0] rounded" />
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] space-y-3">
            <div className="w-32 h-4 bg-[#EAECF0] rounded mb-2" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#EAECF0] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
