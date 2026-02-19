import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataTable, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Artwork, ApiResponse } from '../types/artwork';

const ROWS_PER_PAGE = 12;

const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [bulkSelectCount, setBulkSelectCount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());

  const overlayRef = useRef<OverlayPanel>(null);
  const [customCountInput, setCustomCountInput] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  const fetchArtworks = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${ROWS_PER_PAGE}&fields=${fields}`
      );
      const json: ApiResponse = await res.json();
      setArtworks(json.data);
      setTotalRecords(json.pagination.total);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage, fetchArtworks]);

  const getGlobalIndex = useCallback(
    (rowIndex: number) => (currentPage - 1) * ROWS_PER_PAGE + rowIndex,
    [currentPage]
  );

  const isRowSelected = useCallback(
    (artwork: Artwork, globalIndex: number): boolean => {
      if (deselectedIds.has(artwork.id)) return false;
      if (globalIndex < bulkSelectCount) return true;
      return selectedIds.has(artwork.id);
    },
    [bulkSelectCount, selectedIds, deselectedIds]
  );

  const selectedRows = useMemo<Artwork[]>(
    () =>
      artworks.filter((artwork, idx) =>
        isRowSelected(artwork, getGlobalIndex(idx))
      ),
    [artworks, isRowSelected, getGlobalIndex]
  );

  const handleSelectionChange = (
    e: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ): void => {
    const newSelection: Artwork[] = e.value;
    const newSelectionIds = new Set(newSelection.map((a) => a.id));

    let nextSelectedIds = new Set(selectedIds);
    let nextDeselectedIds = new Set(deselectedIds);

    artworks.forEach((artwork, idx) => {
      const globalIndex = getGlobalIndex(idx);
      const wasSelected = isRowSelected(artwork, globalIndex);
      const nowSelected = newSelectionIds.has(artwork.id);

      if (!wasSelected && nowSelected) {
        if (globalIndex < bulkSelectCount) {
          nextDeselectedIds.delete(artwork.id);
        } else {
          nextSelectedIds.add(artwork.id);
        }
      } else if (wasSelected && !nowSelected) {
        if (globalIndex < bulkSelectCount) {
          nextDeselectedIds.add(artwork.id);
        } else {
          nextSelectedIds.delete(artwork.id);
        }
      }
    });

    setSelectedIds(nextSelectedIds);
    setDeselectedIds(nextDeselectedIds);
  };

  const handleCustomSelection = (): void => {
    const n = parseInt(customCountInput, 10);
    if (isNaN(n) || n <= 0) {
      setInputError('Please enter a valid positive number.');
      return;
    }
    setInputError('');
    setBulkSelectCount(n);
    setSelectedIds(new Set());
    setDeselectedIds(new Set());
    setCustomCountInput('');
    overlayRef.current?.hide();
  };

  const handlePageChange = (e: PaginatorPageChangeEvent): void => {
    setCurrentPage(e.page + 1);
  };

  const totalSelected =
    Math.max(0, bulkSelectCount - deselectedIds.size) + selectedIds.size;

  const nullableText = (value: string | null | number | undefined): React.ReactNode => (
    <span>{value !== null && value !== undefined ? String(value) : 'N/A'}</span>
  );

  const checkboxHeader = (): React.ReactNode => (
    <div className="checkbox-header">
      <button
        className="chevron-btn"
        onClick={(e) => overlayRef.current?.toggle(e)}
        title="Custom row selection"
        type="button"
      >
        <i className="pi pi-chevron-down" style={{ fontSize: '0.7rem' }} />
      </button>
    </div>
  );

  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h1>Art Institute of Chicago</h1>
        {totalSelected > 0 && (
          <span className="selection-badge">
            {totalSelected} row{totalSelected !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      <DataTable
        value={artworks}
        loading={loading}
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        rows={ROWS_PER_PAGE}
        className="artwork-table"
        stripedRows
        showGridlines
        tableStyle={{ minWidth: '60rem' }}
      >
        <Column
          selectionMode="multiple"
          header={checkboxHeader}
          headerStyle={{ width: '5rem', textAlign: 'center' }}
          style={{ textAlign: 'center' }}
        />
        <Column
          field="title"
          header="Title"
          style={{ minWidth: '14rem' }}
          body={(row: Artwork) => nullableText(row.title)}
        />
        <Column
          field="place_of_origin"
          header="Place of Origin"
          style={{ width: '9rem' }}
          body={(row: Artwork) => nullableText(row.place_of_origin)}
        />
        <Column
          field="artist_display"
          header="Artist"
          style={{ minWidth: '13rem' }}
          body={(row: Artwork) => (
            <span className="artist-cell">{row.artist_display ?? 'N/A'}</span>
          )}
        />
        <Column
          field="inscriptions"
          header="Inscriptions"
          style={{ minWidth: '12rem' }}
          body={(row: Artwork) => nullableText(row.inscriptions)}
        />
        <Column
          field="date_start"
          header="Start Date"
          style={{ width: '7rem', textAlign: 'right' }}
          headerStyle={{ textAlign: 'right' }}
          body={(row: Artwork) => nullableText(row.date_start)}
        />
        <Column
          field="date_end"
          header="End Date"
          style={{ width: '7rem', textAlign: 'right' }}
          headerStyle={{ textAlign: 'right' }}
          body={(row: Artwork) => nullableText(row.date_end)}
        />
      </DataTable>

      <div className="paginator-wrapper">
        <span className="records-info">
          Showing{' '}
          <strong>
            {(currentPage - 1) * ROWS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ROWS_PER_PAGE, totalRecords)}
          </strong>{' '}
          of <strong>{totalRecords.toLocaleString()}</strong> entries
        </span>
        <Paginator
          first={(currentPage - 1) * ROWS_PER_PAGE}
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          pageLinkSize={5}
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>

      <OverlayPanel ref={overlayRef} className="selection-overlay">
        <div className="overlay-content">
          <p className="overlay-title">Select rows</p>
          <p className="overlay-desc">
            Enter how many rows to select from the top (across all pages, no pre-fetching).
          </p>
          <div className="overlay-input-row">
            <InputText
              value={customCountInput}
              onChange={(e) => {
                setCustomCountInput(e.target.value);
                setInputError('');
              }}
              placeholder="e.g. 25"
              keyfilter="int"
              className="overlay-input"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSelection()}
              autoFocus
            />
            <Button
              label="Select"
              size="small"
              onClick={handleCustomSelection}
              className="overlay-btn"
            />
          </div>
          {inputError && <p className="overlay-error">{inputError}</p>}
        </div>
      </OverlayPanel>
    </div>
  );
};

export default ArtworkTable;
