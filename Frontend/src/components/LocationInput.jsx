import { useState, useEffect, useRef } from "react";

/**
 * LocationInput — text input with area autocomplete via OpenStreetMap Nominatim.
 * Props:
 *   value          – controlled string value (optional)
 *   onChange       – called with new string on every keystroke / suggestion pick (optional)
 *   placeholder    – input placeholder text
 *   inputClassName – className applied to the <input> element
 *   className      – className applied to the wrapping <div> (default: "relative")
 */
function LocationInput({ value, onChange, onCommit, placeholder, inputClassName = "", className = "relative" }) {
  const [query, setQuery] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [fetching, setFetching] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Keep internal query in sync when controlled value changes externally
  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDrop(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setFetching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange?.(e.target.value);
  };

  const handleSelect = (place) => {
    const addr = place.address || {};
    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.city_district ||
      "";
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";
    const label = [area, city, state].filter(Boolean).join(", ") || place.display_name;
    setQuery(label);
    onChange?.(label);
    onCommit?.(label);
    setSuggestions([]);
    setShowDrop(false);
  };

  return (
    <div ref={containerRef} className={className}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setShowDrop(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setShowDrop(false);
          if (e.key === 'Enter') { setShowDrop(false); onCommit?.(query); }
        }}
        placeholder={placeholder || "Enter location..."}
        className={inputClassName}
        autoComplete="off"
      />
      {fetching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] animate-pulse pointer-events-none">
          Searching…
        </span>
      )}
      {showDrop && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto text-sm">
          {suggestions.map((place) => {
            const addr = place.address || {};
            const area =
              addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const country = addr.country || "";
            const short = [area, city, state].filter(Boolean).join(", ");
            return (
              <li
                key={place.place_id}
                onMouseDown={() => handleSelect(place)}
                className="px-4 py-2.5 hover:bg-orange-50 hover:text-[#FF5C00] cursor-pointer border-b last:border-b-0 border-gray-100"
              >
                <p className="font-medium text-gray-800 truncate">{short || place.display_name}</p>
                {country && (
                  <p className="text-[11px] text-gray-400 truncate">{country}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LocationInput;
