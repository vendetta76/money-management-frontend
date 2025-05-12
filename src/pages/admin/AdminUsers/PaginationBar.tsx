interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
  }
  
  export default function PaginationBar({ currentPage, totalPages, onNext, onPrev }: PaginationBarProps) {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        <button
          disabled={currentPage === 1}
          onClick={onPrev}
          className="px-3 py-1 text-sm rounded disabled:opacity-30 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          &larr;
        </button>
  
        <span className="text-sm text-black dark:text-white">
          Page {currentPage} of {totalPages}
        </span>
  
        <button
          disabled={currentPage === totalPages}
          onClick={onNext}
          className="px-3 py-1 text-sm rounded disabled:opacity-30 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          &rarr;
        </button>
      </div>
    );
  }
  