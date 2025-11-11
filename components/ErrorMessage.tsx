// ErrorMessage.tsx
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-400 text-red-800 px-5 py-4 rounded-r-lg shadow-sm relative">
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-sm">Oops! Something went wrong</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <div className="absolute top-2 right-2 w-1 h-1 bg-red-400 rounded-full opacity-60"></div>
    </div>
  );
}
