import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import v from 'voca';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { NodeAttribute } from './index.t';

export interface Column {
  field: string;
  type: string;
}

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

const makeField = (fieldName: string, fieldType: string, hidden?: boolean) => {
  return {
    field: fieldName,
    filter: detectFilter(fieldType),
    minWidth: 100,
    headerName: toTitleCase(fieldName),
    enableRowGroup: detectRowGroupEnabled(fieldType),
    hide: hidden || false,
  };
};

const NodeTable: React.FC<NodeTableProps> = (props) => {
  const gridRef = useRef<any>();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState<NodeAttribute[]>(props.nodes);
  const [selectedRows, setSelectedRows] = useState<NodeAttribute[]>([]);

  const selectedRowsRef = useRef<NodeAttribute[]>([]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  // More details on columnDefs: https://www.ag-grid.com/react-data-grid/column-definitions/
  const defaultColumns = ['id', 'label', 'name', 'resource', 'description', 'degree', 'cluster'];
  const [columnDefs, setColumnDefs] = useState<any[]>([
    {
      field: 'id',
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      filter: 'agTextColumnFilter',
    },
    makeField('label', 'string'),
    makeField('name', 'string'),
    makeField('resource', 'string'),
    makeField('description', 'string'),
    makeField('degree', 'number'),
    makeField('cluster', 'string'),
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
      'NodeTable - onSelectedChanged - selectedRows: ',
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
        />
      </div>
    </div>
  );
};

export default NodeTable;
