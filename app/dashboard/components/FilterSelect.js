"use client";

import { CalendarDays, History, InfinityIcon } from "lucide-react";

export default function FilterSelect({ filter, setFilter }) {
  const options = [
    { value: "bulan-ini", label: "Bulan Ini", icon: CalendarDays },
    { value: "bulan-lalu", label: "Bulan Lalu", icon: History },
    { value: "semua", label: "Semua", icon: InfinityIcon },
  ];

  return (
    <div className="flex justify-end w-full">
      <div
        className="
          flex gap-2 sm:gap-3 
          bg-white/70 backdrop-blur-sm 
          border border-gray-200 shadow-md 
          rounded-xl p-2 sm:p-3 
          transition-all duration-300 hover:shadow-lg 
          overflow-x-auto sm:overflow-visible
          w-full sm:w-auto
          scrollbar-hide
        "
      >
        <div className="flex flex-nowrap sm:flex-wrap w-max sm:w-auto">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 
                ${
                  filter === value
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md scale-105"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  filter === value ? "text-white" : "text-blue-500"
                }`}
              />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
