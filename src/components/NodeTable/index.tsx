import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import v from 'voca';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { NodeAttribute } from './index.t';
import { guessLink } from '../utils';
import { SelectionChangedEvent } from 'ag-grid-community';
import { SizeColumnsToFitGridStrategy } from 'ag-grid-enterprise';

export interface Column {
  field: string;
  type: string;
}

const autoSizeStrategy: SizeColumnsToFitGridStrategy = {
  type: 'fitGridWidth',
};

export interface NodeTableProps {
  style?: React.CSSProperties;
  className?: string;
  onSelectedRows?: (selectedRows: NodeAttribute[], oldSelectedRows: NodeAttribute[]) => void;
  selectedKeys?: string[];
  nodes: NodeAttribute[];
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

const removeComplicatedFields = (nodes: NodeAttribute[]): NodeAttribute[] => {
  return nodes.map((node: NodeAttribute) => {
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === 'object') {
        delete node[key];
      }
    });

    return node;
  });
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
  };

  if (minWidth) {
    fieldConfig['minWidth'] = minWidth;
  }

  if (cellRenderer) {
    fieldConfig['cellRenderer'] = cellRenderer;
  }

  return fieldConfig;
};

const NodeTable: React.FC<NodeTableProps> = (props) => {
  const gridRef = useRef<any>();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState<NodeAttribute[]>(removeComplicatedFields(props.nodes));
  const [selectedRows, setSelectedRows] = useState<NodeAttribute[]>([]);

  const selectedRowsRef = useRef<NodeAttribute[]>([]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  // More details on columnDefs: https://www.ag-grid.com/react-data-grid/column-definitions/
  const defaultColumns = ['id', 'label', 'name', 'resource', 'description', 'degree', 'cluster'];
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
    makeField('id', 'string', true),
    makeField('label', 'string'),
    makeField('name', 'string', false, (params: NodeAttribute) => {
      console.log('NodeTable - makeField - name - params: ', params, guessLink(params.data.label));
      return (
        <a href={guessLink(params.data.label)} target="_blank">
          {params.value}
        </a>
      );
    }),
    makeField('resource', 'string'),
    makeField('cluster', 'string'),
    makeField('description', 'string'),
    makeField('degree', 'number'),
  ]);

  useEffect(() => {
    const allColumns = props.nodes
      .map((node: NodeAttribute) => {
        return Object.keys(node).map((key) => {
          return { field: key, type: typeof node[key] };
        });
      })
      .reduce((acc: Column[], val: Column[]) => acc.concat(val), [])
      .filter((column: Column, index: number, self: Column[]) => {
        return self.findIndex((c) => c.field === column.field) === index;
      });

    console.log('NodeTable - useEffect - allColumns: ', allColumns);

    const additionalColumns = allColumns.filter((column: Column) => {
      if (!defaultColumns.includes(column.field)) {
        return true;
      }
    });

    console.log('NodeTable - useEffect - additionalColumns: ', additionalColumns);

    const additionalColumnDefs = additionalColumns.map((column: Column) => {
      return makeField(column.field, column.type, true);
    });

    console.log('NodeTable - useEffect - additionalColumnDefs: ', additionalColumnDefs);
    setColumnDefs(columnDefs.concat(additionalColumnDefs));
  }, [props.nodes]);

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
      'NodeTable - onSelectedChanged - selectedRows: ',
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
    // @ts-ignore
    params.api.forEachNode((node) => {
      if (props.selectedKeys && props.selectedKeys.includes(node.data.id)) {
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
  }, [props.selectedKeys, props.nodes]);

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
          suppressRowClickSelection={true}
          sideBar={false}
          statusBar={statusBar}
          enableCellTextSelection={true}
          enableBrowserTooltips={true}
          rowMultiSelectWithClick={true}
          onGridReady={onGridReady}
          autoSizeStrategy={autoSizeStrategy}
          onSelectionChanged={onSelectedChanged}
        />
      </div>
    </div>
  );
};

export default NodeTable;
