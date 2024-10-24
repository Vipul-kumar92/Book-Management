import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
    <nav class="bg-black">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button type="button" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span class="absolute -inset-0.5"></span>
              <span class="sr-only">Open main menu</span>
              
            </button>
          </div>
          <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex flex-shrink-0 items-center">
              <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-gray-300" />
            </div>
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <Link to="" className="bg-gray-900 text-white rounded-md px-2 py-2 text-sm font-medium" aria-current="page">Book Store</Link>
                <Link to="/" class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-20 py-2 text-sm font-medium">Home</Link>
                <Link to="/book" class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-10 py-2 text-sm font-medium">Available Books</Link>
                <Link to="/mybook" class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-10 py-2 text-sm font-medium">My Book</Link>
                <Link to="/Add" class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-10 py-2 text-sm font-medium">Add Books</Link>
                <Link to="/registration" class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-10 py-2 text-sm font-medium">Book Registration</Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
