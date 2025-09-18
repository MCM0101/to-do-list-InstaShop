import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">This page doesn't exist.</h1>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to home screen!
        </Link>
      </div>
    </div>
  );
}

