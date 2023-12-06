import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchAutocompleteSuggestions = async (searchText) => {
    try {
      const response = await fetch(`http://192.168.2.19:8000/api/v1/autocomplete/?query=${searchText}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAutocompleteSuggestions(data.suggestions);
      } else {
        console.error('Autocomplete fetch failed with status:', response.status);
        setAutocompleteSuggestions([]);
      }
    } catch (error) {
      console.error('Error during autocomplete fetch:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    try {
      const response = await fetch(`http://192.168.2.19:8000/api/v1/search/?search=${query}&page=0&size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
      } else {
        console.error('Search failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedDoc = searchResults.find(doc => doc.content.includes(suggestion));
    setSelectedDocument(selectedDoc);
    setShowSuggestions(false);
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([`ID: ${selectedDocument.id}\nContent: ${selectedDocument.content}\nProcessed At: ${new Date(selectedDocument.processed_at).toLocaleString()}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "document.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  // Gestion du clic extérieur pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".autocomplete")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', padding: '20px' }}>
      <div style={{ width: '50%' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchAutocompleteSuggestions(e.target.value);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="What are you searching for?"
            style={{ width: '100%', padding: '15px 20px', fontSize: '18px', borderRadius: '50px', border: '1px solid #ccc', outline: 'none', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSearch} style={{ fontSize: '20px', color: '#333' }} />
          </button>
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="autocomplete" style={{ position: 'absolute', width: '100%', background: 'white', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {autocompleteSuggestions.map((suggestion, index) => (
                              <div key={index} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleSuggestionClick(suggestion)}>
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </form>
            
                    {/* Search Results */}
                    <div className="search-results" style={{ marginTop: '20px' }}>
                      {searchResults.length > 0 && searchResults.map((item) => (
                        <div key={item.id} className="search-result-item" style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '15px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => setSelectedDocument(item)}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ID: {item.id}</h3>
                          <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '4px' }}>
                            <strong>Processed At:</strong> {new Date(item.processed_at).toLocaleString()}
                          </p>
                          <p style={{ color: '#333', marginTop: '8px' }}>
                            <strong>Content:</strong> {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
            
                  {/* Selected Document Details */}
                  <div style={{ width: '50%', padding: '20px', borderLeft: '1px solid #ccc', boxSizing: 'border-box' }}>
                    {selectedDocument && (
                      <div style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                        <h3>ID: {selectedDocument.id}</h3>
                        <p><strong>Content:</strong> {selectedDocument.content}</p>
                        <p><strong>Processed At:</strong> {new Date(selectedDocument.processed_at).toLocaleString()}</p>
                        <button onClick={downloadTxtFile} style={{ margin: '10px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faDownload} /> Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            export default App;
            