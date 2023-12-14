import React, { useState, useContext } from 'react';
import { Empty, Tabs } from 'antd';
import NodeTable from '../../NodeTable';
import EdgeTable from '../../EdgeTable';
import { NodeAttribute } from '../../NodeTable/index.t';
import { EdgeAttribute } from '../../EdgeTable/index.t';
import { CustomGraphinContext } from '../../Context/CustomGraphinContext';

const TableTabs = (props: any) => {
  const counts = React.Children.count(props.children);
  const childrenArray = React.Children.toArray(props.children);
  const items = [
    { label: 'Nodes', key: 'nodes', children: counts >= 2 ? childrenArray[0] : 'No Content' },
    { label: 'Edges', key: 'edges', children: counts >= 2 ? childrenArray[1] : 'No Content' },
  ];
  return (
    <Tabs className="tabs-nav-left">
      {items.map((item) => {
        return (
          <Tabs.TabPane tab={item.label} key={item.key}>
            {item.children}
          </Tabs.TabPane>
        );
      })}
    </Tabs>
  );
};

export interface GraphTableProps {
  style?: React.CSSProperties;
  className?: string;
  nodeDataSources: NodeAttribute[];
  edgeDataSources: EdgeAttribute[];
  selectedNodeKeys?: string[];
  selectedEdgeKeys?: string[];
  onSelectedNodes?: (selectedRows: NodeAttribute[]) => Promise<void>;
  onSelectedEdges?: (selectedRows: EdgeAttribute[]) => Promise<void>;
}

const GraphTable: React.FC<GraphTableProps> = (props) => {
  const { graph } = useContext(CustomGraphinContext);

  return (
    <TableTabs>
      {props.nodeDataSources.length > 0 ? (
        <NodeTable
          nodes={props.nodeDataSources as NodeAttribute[]}
          selectedKeys={props.selectedNodeKeys}
          onSelectedRows={(selectedRows: NodeAttribute[], oldSelectedRows: NodeAttribute[]) => {
            props.onSelectedNodes &&
              props.onSelectedNodes(selectedRows).then((rows) => {
                const selectedNodeIds = selectedRows.map((row) => row.id);
                if (selectedNodeIds.length === 0 || !graph) {
                  return;
                }

                if (selectedNodeIds === props.selectedNodeKeys) {
                  // When we enter the table again, the selectedNodeKeys will be the same as the selectedNodeIds, but the ag-grid will still trigger the onSelectedRows event, so we need to ignore it.
                  return;
                }

                console.log(
                  'onSelectedRows: ',
                  selectedNodeIds,
                  props.selectedNodeKeys,
                  props.selectedEdgeKeys,
                  graph,
                );
                graph.pushStack(
                  'select-nodes',
                  {
                    after: selectedNodeIds,
                    before: oldSelectedRows.map((row) => row.id),
                  },
                  'undo',
                );
              });
          }}
          style={{ minHeight: '300px', height: 'calc(100vh - 55px)' }}
        />
      ) : (
        <Empty />
      )}
      {props.edgeDataSources.length > 0 ? (
        <EdgeTable
          edges={props.edgeDataSources as EdgeAttribute[]}
          selectedKeys={props.selectedEdgeKeys}
          onSelectedRows={(selectedRows: EdgeAttribute[], oldSelectedRows: EdgeAttribute[]) => {
            props.onSelectedEdges &&
              props.onSelectedEdges(selectedRows).then((rows) => {
                const selectedEdgeIds = selectedRows.map((row) => row.relid);
                if (selectedEdgeIds.length === 0 || !graph) {
                  return;
                }

                if (selectedEdgeIds === props.selectedEdgeKeys) {
                  // When we enter the table again, the selectedEdgeKeys will be the same as the selectedEdgeIds, so we need to ignore it.
                  return;
                }

                const selectedNodeIds = selectedRows
                  .map((row) => row.source)
                  .concat(selectedRows.map((row) => row.target));

                const oldSelectedNodeIds = oldSelectedRows
                  .map((row) => row.source)
                  .concat(oldSelectedRows.map((row) => row.target));

                const oldSelectedEdgeIds = oldSelectedRows.map((row) => row.relid);

                console.log(
                  'onSelectedRows: ',
                  selectedEdgeIds,
                  selectedNodeIds,
                  oldSelectedEdgeIds,
                  oldSelectedNodeIds,
                  graph,
                );
                graph.pushStack(
                  'select-edges',
                  {
                    after: {
                      edges: selectedEdgeIds,
                      nodes: selectedNodeIds,
                    },
                    before: {
                      edges: oldSelectedEdgeIds,
                      nodes: oldSelectedNodeIds,
                    },
                  },
                  'undo',
                );
              });
          }}
          style={{ minHeight: '300px', height: 'calc(100vh - 55px)' }}
        />
      ) : (
        <Empty />
      )}
    </TableTabs>
  );
};

export default GraphTable;
