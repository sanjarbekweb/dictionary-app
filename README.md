# English Dictionary

A browser-based English dictionary with an Uzbek interface. Search for definitions, parts of speech, examples, synonyms, antonyms, and pronunciation audio when the API provides them.

## Run

Open `index.html` in a modern browser, or serve this folder with a local static server. No package manager, build step, or API key is required. Internet access is needed for the external APIs and CDN assets.

## Features

- English word lookup through Dictionary API.
- Datamuse suggestions, validated against the dictionary.
- Pronunciation playback when audio is available.
- The five most recent distinct searches stored in this browser's `localStorage`.
- History shortcuts and a clear-history action.

Enter a word and use the search button or Enter. Start typing at least two characters for suggestions.

## Files

- `index.html` — search interface and external resources.
- `main.js` — lookup, suggestions, audio controls, and local history.
- `style.css` — presentation.

API failures or missing dictionary entries are displayed in the interface. History is local to the browser; there is no account or server database. No automated test suite is included.
