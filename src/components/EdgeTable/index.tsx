// 'use strict';

import React, { useCallback, useMemo, useRef, useState, StrictMode, useEffect } from 'react';
import v from 'voca';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { EdgeAttribute } from './index.t';
import { SelectionChangedEvent } from 'ag-grid-community';
import { SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy } from 'ag-grid-enterprise';
import { uniq, uniqBy } from 'lodash';
import { guessLink } from '../utils';

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

const detectAggFunc = (fieldType: string) => {
  switch (fieldType) {
    case 'number':
      return 'avg';
    default:
      return (params: any) => {
        if (params.values.length === 0) {
          return null;
        } else {
          return uniq(params.values).join(',');
        }
      };
  }
};

const makeField = (
  fieldName: string,
  fieldType: string,
  hidden?: boolean,
  cellRenderer?: (params: any) => any,
  minWidth?: number,
) => {
  let fieldConfig: any = {
    field: fieldName,
    filter: detectFilter(fieldType),
    headerName: toTitleCase(fieldName),
    enableRowGroup: detectRowGroupEnabled(fieldType),
    hide: hidden || false,
    tooltipField: fieldName,
    aggFunc: detectAggFunc(fieldType),
  };

  if (minWidth) {
    fieldConfig['minWidth'] = minWidth;
  }

  if (cellRenderer) {
    fieldConfig['cellRenderer'] = cellRenderer;
  }

  return fieldConfig;
};

const removeComplicatedFields = (edges: EdgeAttribute[]): EdgeAttribute[] => {
  return edges.map((edge: EdgeAttribute) => {
    Object.keys(edge).forEach((key) => {
      if (typeof edge[key] === 'object') {
        delete edge[key];
      }
    });

    return edge;
  });
};

const EdgeTable: React.FC<EdgeTableProps> = (props) => {
  const gridRef = useRef<any>();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState<EdgeAttribute[]>(removeComplicatedFields(props.edges));
  const [selectedRows, setSelectedRows] = useState<EdgeAttribute[]>([]);

  const selectedRowsRef = useRef<EdgeAttribute[]>([]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  // More details on columnDefs: https://www.ag-grid.com/react-data-grid/column-definitions/
  const defaultColumns = [
    'reltype',
    'source_name',
    'target_name',
    'score',
    'source_type',
    'target_type',
    'source_id',
    'target_id',
    // 'source_resource',
    // 'target_resource',
    // 'dataset',
    // 'resource',
    // 'relid',
    // 'source',
    // 'target',
    // 'key_sentence',
    // 'pmids',
  ];
  const [columnDefs, setColumnDefs] = useState<any[]>([
    {
      headerName: '#',
      cellRenderer: function (params: any) {
        // Return the row index for the first column
        return params.node.rowIndex + 1;
      },
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      filter: 'agTextColumnFilter',
    },
  ]);

  const autoSizeStrategy: SizeColumnsToContentStrategy | SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth', // fitCellContents
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

    const otherColumnDefs = allColumns.map((column: Column) => {
      return makeField4Link(column);
    });

    console.log('EdgeTable - useEffect - columnDefs: ', otherColumnDefs);
    const uniqueColumnDefs = uniqBy(columnDefs.concat(otherColumnDefs), 'field');
    // Keep the order of uniqueColumnDefs as the same as the defaultColumns.
    const sortedColumnDefs = uniqueColumnDefs.sort((a, b) => {
      return defaultColumns.indexOf(a.field) - defaultColumns.indexOf(b.field);
    });

    setColumnDefs(sortedColumnDefs);
  }, [props.edges]);

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      filter: true,
    };
  }, []);

  const onSelectedChanged = useCallback((event: SelectionChangedEvent<any>) => {
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

    if (event.source === 'gridInitializing') {
      // Don't trigger onSelectedRows when the grid is initializing.
      return;
    } else {
      props.onSelectedRows && props.onSelectedRows(currentSelection, oldSelectedRows);
    }
  }, []);

  const onGridReady = (params: any) => {
    console.log('onGridReady - selectedKeys: ', props.selectedKeys);

    // @ts-ignore
    params.api.forEachNode((node) => {
      if (props.selectedKeys && props.selectedKeys.includes(node.data.relid)) {
        node.setSelected(true, false, 'gridInitializing');
      } else {
        node.setSelected(false, false, 'gridInitializing');
      }
    });
  };

  useEffect(() => {
    if (!gridRef.current || (gridRef.current && !gridRef.current.api)) {
      return;
    } else {
      onGridReady(gridRef.current);
    }
  }, [props.selectedKeys, props.edges]);

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

  const makeField4Link = (column: Column): any => {
    if (column.field === 'source_name') {
      return makeField(
        column.field,
        column.type,
        false,
        (params: EdgeAttribute) => {
          return (
            <a href={guessLink(params.source_id)} target="_blank">
              {params.value}
            </a>
          );
        },
        150,
      );
    }

    if (column.field === 'target_name') {
      return makeField(
        column.field,
        column.type,
        false,
        (params: EdgeAttribute) => {
          return (
            <a href={guessLink(params.target_id)} target="_blank">
              {params.value}
            </a>
          );
        },
        180,
      );
    }

    if (!defaultColumns.includes(column.field)) {
      return makeField(column.field, column.type, true);
    } else {
      return makeField(column.field, column.type, false);
    }
  };

  const onColumnRowGroupChanged = (event: any) => {
    console.log('onColumnRowGroupChanged: ', event);

    // Hide the # column when the row group is opened.
    if (event.column.rowGroupActive) {
      const newColumnDefs = columnDefs.map((columnDef) => {
        if (columnDef.headerName === '#') {
          return { ...columnDef, hide: true };
        } else {
          return columnDef;
        }
      });

      setColumnDefs(newColumnDefs);
    } else {
      const newColumnDefs = columnDefs.map((columnDef) => {
        if (columnDef.headerName === '#') {
          return { ...columnDef, hide: false };
        } else {
          return columnDef;
        }
      });

      setColumnDefs(newColumnDefs);
    }
  };

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
          suppressRowClickSelection={true}
          sideBar={false}
          groupAllowUnbalanced
          enableCellTextSelection={true}
          enableBrowserTooltips={true}
          rowMultiSelectWithClick={true}
          groupIncludeFooter={true}
          groupIncludeTotalFooter={true}
          statusBar={statusBar}
          onGridReady={onGridReady}
          onColumnRowGroupChanged={onColumnRowGroupChanged}
          onSelectionChanged={onSelectedChanged}
          autoSizeStrategy={autoSizeStrategy}
        />
      </div>
    </div>
  );
};

export default EdgeTable;
