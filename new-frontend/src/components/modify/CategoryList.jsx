import React from "react";

const CategoryList = ({ categories }) => {
  if (!categories.length) {
    return <div>No categories yet.</div>;
  }

  return (
    <ul className="mt-3">
      {categories.map((cat) => (
        <li key={cat.id} className="border p-2 mb-2 rounded">
          {cat.name}
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;

// #### have no reload of categories when swithcing mod pages shoudl happen
