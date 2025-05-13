interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
  }
  
  export default function PaginationBar({ currentPage, totalPages, onNext, onPrev }: PaginationBarProps) {
    return (
      <div className="flex items-center justify-center gap-4 py-6">
        <button
          disabled={currentPage === 1}
          onClick={onPrev}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ←
        </button>
  
        <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
          Page {currentPage} of {totalPages}
        </span>
  
        <button
          disabled={currentPage === totalPages}
          onClick={onNext}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          →
        </button>
      </div>
    );
  }
  