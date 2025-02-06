import React from 'react';
import { FileQuestion, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <FileQuestion className="w-24 h-24 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go back home
        </Link>
      </div>
    </div>
  );
}