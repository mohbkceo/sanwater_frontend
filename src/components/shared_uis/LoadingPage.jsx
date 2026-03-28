import React, { useEffect, useState } from "react";

const messages = [
  "Loading product data...",
  "Fetching images...",
  "Preparing experience...",
  "Almost ready..."
];

function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = Math.random() * 12; 
        return Math.min(prev + increment, 100);
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(msgInterval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-5xl">

        
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{messages[messageIndex]}</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Image Skeleton */}
          <div className="space-y-4">
            <div className="w-full h-87.5 bg-gray-200 rounded-2xl animate-pulse"></div>

            <div className="flex gap-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>

            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>

            <div className="flex gap-2">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"
                ></div>
              ))}
            </div>

            <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse"></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoadingPage;