export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-12 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-3 border-slate-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute top-1 left-1 w-8 h-8 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-slate-600 text-sm font-medium">Finding your matches...</p>
    </div>
  );
}