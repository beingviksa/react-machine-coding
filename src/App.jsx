import { useState, useEffect, useRef, useCallback } from "react";

const App = () => {
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const cacheRef = useRef({});
  const debounceRef = useRef(null);
  const resultsRef = useRef(null);

  const fetchData = useCallback(async (query) => {
    if (!query.trim()) return;

    if (cacheRef.current[query]) {
      setRecipes(cacheRef.current[query]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://dummyjson.com/recipes/search?q=${query}`
      );
      const data = await res.json();
      cacheRef.current[query] = data?.recipes || [];
      setRecipes(data?.recipes || []);
    } catch (err) {
      setError("Failed to fetch recipes", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (input) fetchData(input);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [input, fetchData]);

  const handleKeyDown = (e) => {
    if (!showResults || recipes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        setSelectedIndex((prev) => (prev < recipes.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : recipes.length - 1));
        break;
      case "Enter":
        if (selectedIndex !== -1) {
          setInput(recipes[selectedIndex].name);
          setShowResults(false);
        }
        break;
      case "Escape":
        setShowResults(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="App">
      <h1>Autocomplete Search Bar</h1>
      <input
        type="text"
        className="search-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setSelectedIndex(-1);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onKeyDown={handleKeyDown}
      />
      {showResults && (
        <div className="results-container" ref={resultsRef}>
          {loading ? (
            <span className="loading">Loading...</span>
          ) : error ? (
            <span className="error">{error}</span>
          ) : recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className={`result ${
                  selectedIndex === index ? "selected" : ""
                }`}
                onMouseDown={() => {
                  setInput(recipe.name);
                  setShowResults(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {recipe.name}
              </div>
            ))
          ) : (
            <span className="no-results">No recipes found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
