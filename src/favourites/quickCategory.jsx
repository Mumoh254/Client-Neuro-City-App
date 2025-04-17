// QuickCategories.jsx
import React from "react";

const categories = [
  { name: "Shoes", icon: "👟" },
  { name: "Watches", icon: "⌚" },
  { name: "Clothing", icon: "👕" },
  { name: "Bags", icon: "👜" },
  { name: "Accessories", icon: "🕶️" },
];

const QuickCategories = ({ onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4">
      {categories.map((cat, index) => (
        <button
          key={index}
          onClick={() => onSelectCategory && onSelectCategory(cat.name)}
          className="flex flex-col items-center bg-white border rounded-xl p-4 shadow hover:bg-gray-100 transition"
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="mt-2 text-sm font-semibold text-gray-800">{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickCategories;
