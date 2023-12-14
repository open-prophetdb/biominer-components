// 'use strict';

import React, { useCallback, useMemo, useRef, useState, StrictMode, useEffect } from 'react';
import v from 'voca';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { EdgeAttribute } from './index.t';
import { SizeColumnsToContentStrategy } from 'ag-grid-enterprise';

export interface Column {
  field: string;
  type: string;
}

export interface EdgeTableProps {
  style?: React.CSSProperties;
  className?: string;
  selectedKeys?: string[];
  onSelectedRows?: (selectedRows: EdgeAttribute[], oldSelectedRows: EdgeAttribute[]) => void;
  edges: EdgeAttribute[];
}

const detectFilter = (fieldType: string) => {
  switch (fieldType) {
    case 'number':
      return 'agNumberColumnFilter';
    case 'date':
      return 'agDateColumnFilter';
    case 'boolean':
      return 'agSetColumnFilter';
    case 'object':
      return 'agTextColumnFilter';
    default:
      return 'agTextColumnFilter';
  }
};

const detectRowGroupEnabled = (fieldType: string): boolean => {
  switch (fieldType) {
    case 'number':
      return true;
    case 'date':
      return true;
    case 'boolean':
      return false;
    case 'object':
      return false;
    default:
      return true;
  }
};

const toTitleCase = (str: string) => {
  return v.titleCase(str.replace(/_/g, ' '));
};

const makeField = (fieldName: string, fieldType: string, hidden?: boolean) => {
  return {
    field: fieldName,
    filter: detectFilter(fieldType),
    minWidth: 150,
    headerName: toTitleCase(fieldName),
    enableRowGroup: detectRowGroupEnabled(fieldType),
    hide: hidden || false,
  };
};

const EdgeTable: React.FC<EdgeTableProps> = (props) => {
  const gridRef = useRef<any>();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState<EdgeAttribute[]>(props.edges);
  const [selectedRows, setSelectedRows] = useState<EdgeAttribute[]>([]);

  const selectedRowsRef = useRef<EdgeAttribute[]>([]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  // More details on columnDefs: https://www.ag-grid.com/react-data-grid/column-definitions/
  const defaultColumns = [
    'relid',
    'reltype',
    'source',
    'target',
    // 'source_id',
    // 'target_id',
    'source_name',
    'target_name',
    'source_resource',
    'target_resource',
    'source_type',
    'target_type',
    'dataset',
    'resource',
    // 'key_sentence',
    // 'pmids',
    // 'score',
  ];
  const [columnDefs, setColumnDefs] = useState<any[]>([
    {
      field: 'relid',
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      filter: 'agTextColumnFilter',
    },
    makeField('reltype', 'string'),
    makeField('source', 'string'),
    makeField('target', 'string'),
    // makeField('source_id', 'string'),
    // makeField('target_id', 'string'),
    makeField('source_name', 'string'),
    makeField('target_name', 'string'),
    makeField('source_resource', 'string'),
    makeField('target_resource', 'string'),
    makeField('source_type', 'string'),
    makeField('target_type', 'string'),
    makeField('dataset', 'string'),
    makeField('resource', 'string'),
    // makeField('key_sentence', 'string'),
    // makeField('pmids', 'string'),
    // makeField('score', 'number'),
  ]);

  const autoSizeStrategy: SizeColumnsToContentStrategy = {
    type: 'fitCellContents',
  };

  useEffect(() => {
    const allColumns = props.edges
      .map((edge: EdgeAttribute) => {
        return Object.keys(edge).map((key) => {
          return { field: key, type: typeof edge[key] };
        });
      })
      .reduce((acc: Column[], val: Column[]) => acc.concat(val), [])
      .filter((column: Column, index: number, self: Column[]) => {
        return self.findIndex((c) => c.field === column.field) === index;
      });

    console.log('EdgeTable - useEffect - allColumns: ', allColumns);

    const additionalColumns = allColumns.filter((column: Column) => {
      if (!defaultColumns.includes(column.field)) {
        return true;
      }
    });

    console.log('EdgeTable - useEffect - additionalColumns: ', additionalColumns);

    const additionalColumnDefs = additionalColumns.map((column: Column) => {
      return makeField(column.field, column.type, true);
    });

    console.log('EdgeTable - useEffect - additionalColumnDefs: ', additionalColumnDefs);
    setColumnDefs(columnDefs.concat(additionalColumnDefs));
  }, [props.edges]);

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 180,
      filter: true,
    };
  }, []);

  const onSelectedChanged = useCallback(() => {
    // @ts-ignore
    if (!gridRef.current || (gridRef.current && !gridRef.current.api)) {
      return;
    }

    const oldSelectedRows = selectedRowsRef.current;
    const currentSelection = gridRef.current.api.getSelectedRows();
    console.log(
      'EdgeTable - onSelectedChanged - selectedRows: ',
      oldSelectedRows,
      currentSelection,
    );
    setSelectedRows(currentSelection);
    props.onSelectedRows && props.onSelectedRows(currentSelection, oldSelectedRows);
  }, []);

  const onGridReady = useCallback(
    (params: any) => {
      // @ts-ignore
      params.api.forEachNode((node) => {
        if (props.selectedKeys && props.selectedKeys.includes(node.data.id)) {
          node.setSelected(true);
        }
      });
    },
    [props.selectedKeys],
  );

  const statusBar = useMemo(() => {
    return {
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
        { statusPanel: 'agTotalRowCountComponent', align: 'center' },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' },
      ],
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={{ ...gridStyle, ...props.style }} className={'ag-theme-quartz'}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection={'multiple'}
          defaultColDef={defaultColDef}
          enableAdvancedFilter={true}
          groupSelectsChildren={true}
          rowGroupPanelShow={'always'}
          suppressRowClickSelection={false}
          sideBar={false}
          statusBar={statusBar}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectedChanged}
          autoSizeStrategy={autoSizeStrategy}
        />
      </div>
    </div>
  );
};

export default EdgeTable;
