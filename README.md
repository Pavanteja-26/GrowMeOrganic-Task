# Art Institute of Chicago - Artwork Table

This is my submission for the React internship assignment. It shows artwork data from the Art Institute of Chicago's public API in a table with pagination and row selection.

## Tech Used

- Vite + React + TypeScript
- PrimeReact (DataTable, OverlayPanel, Paginator)

## How to Run

```bash
npm install
npm run dev
```

Then go to http://localhost:5173 in your browser.

To build for deployment:

```bash
npm run build
```

Upload the `dist/` folder to Netlify or Cloudflare.

## What I Built

### Table
Displays artwork data (title, place of origin, artist, inscriptions, start date, end date) fetched from the API. Used PrimeReact's DataTable component for this.

### Pagination
Every time you change the page, it makes a new API call to fetch just that page's data. It doesn't load everything at once.

### Row Selection
You can check individual rows, or use the header checkbox to select/deselect everything on the current page. There's also a small chevron button next to the header checkbox that opens an overlay where you can type a number (like 25) to bulk-select the first N rows across all pages.

### Persistent Selection
This was the tricky part. When you go to page 2 and come back to page 1, your selections are still there. I did this without pre-fetching other pages.

I used 3 pieces of state to track this:

- `bulkSelectCount` - if the user bulk-selects N rows, the first N rows globally are considered selected
- `deselectedIds` - if a row is inside the bulk range but the user unchecks it manually, its ID goes here
- `selectedIds` - rows the user checked individually that are outside the bulk range

Then for any row, I just check:

```
isSelected = (globalIndex < bulkSelectCount AND id not in deselectedIds)
             OR id in selectedIds
```

The global index is just `(page - 1) * 12 + rowIndexOnPage`. No extra API calls needed.

## Folder Structure

```
src/
├── components/
│   └── ArtworkTable.tsx
├── types/
│   └── artwork.ts
├── App.tsx
├── main.tsx
└── index.css
```
