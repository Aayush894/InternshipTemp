import { useState } from "react";
import PropTypes from "prop-types";

function Search({ data }) {
  const [searchItem, setSearchItem] = useState("");
  const [searchResults, setSearchResults] = useState(data);

  const handleEnter = (e) => {
    e.preventDefault();

    const result = data.filter(
      (item) => item.title.toLowerCase() === searchItem.toLowerCase()
    );

    if (result.length !== 0) {
      alert("Valid Search Found");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const searchItem = e.target.value;
    setSearchItem(searchItem);

    if (
      Array.isArray(data) &&
      data.every((item) => item && typeof item === "object" && "title" in item)
    ) {
      const result = data.filter((item) =>
        item.title.toLowerCase().includes(searchItem.toLowerCase())
      );
      setSearchResults(result);
    } else {
      console.error(
        "Invalid data format. 'data' should be an array of objects with a 'title' property."
      );
      setSearchResults([]);
    }
  };
  return (
    <>
    <div style={{ display:"flex", flexDirection: "column", alignItems: "center"}}>
      <input
        type="text"
        placeholder="Search"
        value={searchItem}
        onChange={handleSearch}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleEnter(e);
        }}
        style={{ width: "60%", boxSizing: "border-box", textAlign: "center" }}
      />
      <ul>
        {searchResults.map((item, index) => (
          <li key={index} style={{ color: "#fff" }}>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}

Search.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Search;
