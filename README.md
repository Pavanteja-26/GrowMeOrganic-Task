# Art Institute of Chicago — Artwork Table

A React + TypeScript + Vite application displaying artwork data from the Art Institute of Chicago API with server-side pagination and persistent cross-page row selection.

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **PrimeReact** DataTable, OverlayPanel, Paginator

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
npm run preview
```

---

## Features

### ✅ Server-Side Pagination
Each page change triggers a fresh API call to `https://api.artic.edu/api/v1/artworks?page=N`.
Only the current page's rows are stored in memory.

### ✅ Row Selection (Individual & Select All)
- Checkboxes on every row + a header "select all on page" checkbox.
- The header checkbox has an indeterminate state when only some rows are selected.

### ✅ Custom N-Row Selection Overlay
Click the **chevron (▾)** next to the header checkbox to open an overlay panel.
Type any number (e.g. `25`) and click **Select** — the first 25 rows across all pages are marked as selected **without fetching any other page**.

### ✅ Persistent Cross-Page Selection
Selections survive page navigation. The strategy:

| State variable   | Purpose |
|------------------|---------|
| `bulkSelectCount` | Top-N rows (globally, 0-indexed) are bulk-selected |
| `deselectedIds`   | IDs explicitly unchecked from within the bulk range |
| `selectedIds`     | IDs individually checked outside the bulk range |

A row at **global index** `(page - 1) × 12 + rowIndex` is selected if:
```
(globalIndex < bulkSelectCount AND id ∉ deselectedIds)
OR id ∈ selectedIds
```

**No other pages are ever pre-fetched.** On every page render, selection state is computed from the three lightweight sets above.

---

## Project Structure

```
src/
├── components/
│   └── ArtworkTable.tsx   # Main table with all selection logic
├── types/
│   └── artwork.ts         # TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```
