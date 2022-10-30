import React from "react";

interface Props {
  query: string;
  onChange: (text: string) => void;
  handleSearch: () => void;
}

const Searchbar = ({ query, onChange, handleSearch }: Props) => {
  return (
    <div className="relative">
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <svg
          aria-hidden="true"
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        type="search"
        id="default-search"
        className="block p-4 pl-10 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Rain, forest, nature, storm, etc"
        onChange={(e) => onChange(e.target.value)}
        value={query}
      />
      <button
        onClick={handleSearch}
        className="text-white absolute right-2.5 bottom-2.5 bg-primary-primary hover:bg-primary-hovered focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
      >
        Search
      </button>
    </div>
  );
};
export default Searchbar;
