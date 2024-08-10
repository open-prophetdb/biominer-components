// 'use strict';

import React, { useCallback, useMemo, useRef, useState, StrictMode, useEffect } from 'react';
import v from 'voca';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { EdgeAttribute, MetricAttribute } from './index.t';
import { SelectionChangedEvent } from 'ag-grid-community';
import { SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy } from 'ag-grid-enterprise';
import { uniq } from 'lodash';
import init, * as graph from 'biomedgps-graph';

export interface Column {
  field: string;
  type: string;
}

export interface EdgeTableProps {
  style?: React.CSSProperties;
  className?: string;
  onSelectedRows?: (selectedRows: MetricAttribute[], oldSelectedRows: MetricAttribute[]) => void;
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
  } else {
    fieldConfig['minWidth'] = 50;
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

const calculate_centrality = async (relations: EdgeAttribute[]): Promise<MetricAttribute[]> => {
  await init();
  // Filter the data to only include relationships where both nodes are genes
  // const filteredRelations = relations.filter(rel =>
  //   rel.source_type === "Gene" || rel.target_type === "Gene"
  // );
  // TODO: In the future, we may want to set the other options for the calculate_centrality function
  const result = graph.calculate_centrality(relations, undefined);

  return result.map((item: any) => {
    return {
      entity_id: item.entity_id,
      entity_type: item.entity_type,
      entity_name: item.entity_name,
      betweenness_score: item.betweenness_score,
      degree_score: item.degree_score,
      closeness_score: item.closeness_score,
      eigenvector_score: item.eigenvector_score,
      pagerank_score: item.pagerank_score,
    };
  });
};


const EdgeTable: React.FC<EdgeTableProps> = (props) => {
  const gridRef = useRef<any>();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState<MetricAttribute[]>([]);
  const [selectedRows, setSelectedRows] = useState<MetricAttribute[]>([]);

  useEffect(() => {
    const egdes = removeComplicatedFields(props.edges);
    calculate_centrality(egdes).then((result) => {
      console.log('EdgeTable - useEffect - calculate_centrality - result: ', result);
      setRowData(result);
    });
  }, [props.edges]);

  const selectedRowsRef = useRef<MetricAttribute[]>([]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  // More details on columnDefs: https://www.ag-grid.com/react-data-grid/column-definitions/
  const defaultColumns = [
    'entity_id',
    'entity_type',
    'entity_name',
    'betweenness_score',
    'degree_score',
    'closeness_score',
    'eigenvector_score',
    'pagerank_score',
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
    ...defaultColumns.map((column) => {
      if (column.endsWith('_score')) {
        return makeField(column, 'number', false, (params: any) => {
          return params.value.toFixed(3);
        });
      }

      return makeField(column, 'string');
    }),
  ]);

  const autoSizeStrategy: SizeColumnsToContentStrategy | SizeColumnsToFitGridStrategy = {
    type: 'fitCellContents', // fitGridWidth
  };

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
      'MetricsTable - onSelectedChanged - selectedRows: ',
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

  };

  useEffect(() => {
    if (!gridRef.current || (gridRef.current && !gridRef.current.api)) {
      return;
    } else {
      onGridReady(gridRef.current);
    }
  }, [props.edges]);

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
          groupAllowUnbalanced
          enableCellTextSelection={true}
          enableBrowserTooltips={true}
          rowMultiSelectWithClick={true}
          statusBar={statusBar}
          onGridReady={onGridReady}
          // It seems that the row selection checkbox also works well at the row group mode.
          // onColumnRowGroupChanged={onColumnRowGroupChanged}
          onSelectionChanged={onSelectedChanged}
          autoSizeStrategy={autoSizeStrategy}
          getContextMenuItems={(params: any) => {
            var result = [
              'copy',
              'copyWithHeaders',
              'copyWithGroupHeaders',
              'separator',
              'autoSizeAll',
              'resetColumns',
              'expandAll',
              'contractAll',
              'separator',
              'export',
            ];
            return result;
          }}
        />
      </div>
    </div>
  );
};

export default EdgeTable;
