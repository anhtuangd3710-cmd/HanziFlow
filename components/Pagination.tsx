
import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange, isDisabled = false }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= half) {
      for (let i = 1; i <= maxPagesToShow - 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - half) {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();

  const buttonClass = (isActive = false) => 
    `h-10 px-4 flex items-center justify-center font-semibold rounded-md transition-colors border ${
      isActive
        ? 'bg-blue-600 border-blue-600 text-white cursor-default'
        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
    } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`;
  
  return (
    <nav aria-label="Pagination">
      <ul className="flex items-center gap-2">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isDisabled}
            className={`${buttonClass()} p-2`}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon size={20} />
          </button>
        </li>
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => onPageChange(page)}
                disabled={isDisabled}
                className={buttonClass(page === currentPage)}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span className="h-10 px-4 flex items-center justify-center text-gray-500">
                {page}
              </span>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isDisabled}
            className={`${buttonClass()} p-2`}
            aria-label="Go to next page"
          >
            <ChevronRightIcon size={20} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
