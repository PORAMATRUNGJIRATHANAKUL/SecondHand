import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="relative w-96">
        <input
          type="text"
          placeholder="ค้นหารายการ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          aria-label="ช่องค้นหา"
        />
        <FaSearch
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          aria-hidden="true"
          title="ไอคอนค้นหา"
        />
      </div>
    </div>
  );
};

export default SearchBar;
