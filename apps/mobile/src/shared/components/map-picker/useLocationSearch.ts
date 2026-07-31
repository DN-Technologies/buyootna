import { useRef, useState } from 'react';

import { MAPBOX_ACCESS_TOKEN, SearchResultItem } from './types';

export function useLocationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimerRef = useRef<any>(null);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    searchTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            text,
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=kw&language=ar&proximity=47.9774,29.3759`;

          const res = await fetch(url);
          const data = await res.json();

          if (data && data.features) {
            const results: SearchResultItem[] = data.features.map(
              (item: any) => ({
                id: item.id,
                place_name: item.place_name_ar || item.place_name,
                text: item.text_ar || item.text,
                center: item.center, // [lng, lat]
              }),
            );
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.warn('Search geocoding error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    handleSearchChange,
    clearSearch,
  };
}
