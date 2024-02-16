import React, { useState, useContext, useEffect, memo } from 'react';
import { Empty } from 'antd';
import NodeTable from '../../NodeTable';
import EdgeTable from '../../EdgeTable';
import TableTabs from './TableTabs';
import { NodeAttribute } from '../../NodeTable/index.t';
import { EdgeAttribute } from '../../EdgeTable/index.t';
import { CustomGraphinContext } from '../../Context/CustomGraphinContext';
import { pushStack } from '../../utils';
import { GraphData, GraphEdge, GraphNode } from '../../typings';
import { set, uniq } from 'lodash';

import './GraphTable.less';

export interface GraphTableProps {
  style?: React.CSSProperties;
  emptyMessage?: string;
  className?: string;
  onClose?: () => void;
  onLoadGraph?: (graph: GraphData) => void;
  nodeDataSources: NodeAttribute[];
  edgeDataSources: EdgeAttribute[];
  selectedNodeKeys?: string[];
  selectedEdgeKeys?: string[];
  onSelectedNodes?: (selectedRows: NodeAttribute[]) => Promise<void>;
  onSelectedEdges?: (selectedRows: EdgeAttribute[]) => Promise<void>;
}

const GraphTable: React.FC<GraphTableProps> = (props) => {
  const { graph } = useContext(CustomGraphinContext);
  const emptyMessage = props.emptyMessage || 'No data';
  const [annoEdgeDataSources, setAnnoEdgeDataSources] = useState<EdgeAttribute[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const initGraph = () => {
    const nodes = props.nodeDataSources
      .map((node) => node.metadata)
      .filter((node) => node !== undefined);
    const edges = props.edgeDataSources
      .map((edge) => edge.metadata)
      .filter((edge) => edge !== undefined);
    setSelectedGraph({
      nodes: nodes as GraphNode[],
      edges: edges as GraphEdge[],
    });
  };

  useEffect(() => {
    const tempEdgeDataSources: EdgeAttribute[] = [];
    props.edgeDataSources.forEach((edge) => {
      let source = edge.source;
      let target = edge.target;

      // SourceNode and targetNode must exist
      let sourceNode = props.nodeDataSources.find((node) => node.id === source) as NodeAttribute;
      let targetNode = props.nodeDataSources.find((node) => node.id === target) as NodeAttribute;

      tempEdgeDataSources.push({
        ...edge,
        source_name: sourceNode.name,
        target_name: targetNode.name,
        source_resource: sourceNode.resource,
        target_resource: targetNode.resource,
        source_description: sourceNode.description,
        target_description: targetNode.description,
        // add more attributes here
      });
    });
    setAnnoEdgeDataSources(tempEdgeDataSources);

    initGraph();
  }, [props.nodeDataSources, props.edgeDataSources]);

  return (
    <TableTabs
      onClose={props.onClose}
      onLoadGraph={
        props.onLoadGraph
          ? () => {
              // @ts-ignore Don't worry about this error, the nodes and edges don't have undefined values
              props.onLoadGraph(selectedGraph);
            }
          : undefined
      }
    >
      {props.nodeDataSources.length > 0 ? (
        <NodeTable
          nodes={props.nodeDataSources as NodeAttribute[]}
          selectedKeys={props.selectedNodeKeys}
          onSelectedRows={(selectedRows: NodeAttribute[], oldSelectedRows: NodeAttribute[]) => {
            props.onSelectedNodes &&
              props.onSelectedNodes(selectedRows).then((rows) => {
                const selectedNodeIds = uniq(selectedRows.map((row) => row.id));
                const oldSelectedNodeIds = uniq(oldSelectedRows.map((row) => row.id));
                if (selectedNodeIds.length === 0 || !graph) {
                  return;
                }

                setSelectedGraph({
                  nodes: selectedRows.map((row) => row.metadata) as GraphNode[],
                  edges: [],
                });

                if (
                  selectedNodeIds === props.selectedNodeKeys ||
                  selectedNodeIds === oldSelectedNodeIds
                ) {
                  // When we enter the table again, the selectedNodeKeys will be the same as the selectedNodeIds, but the ag-grid will still trigger the onSelectedRows event, so we need to ignore it.
                  return;
                }

                console.log(
                  'onSelectedRows: ',
                  selectedNodeIds,
                  props.selectedNodeKeys,
                  props.selectedEdgeKeys,
                  oldSelectedNodeIds,
                  graph,
                );
                // graph.pushStack(
                //   'select-nodes',
                //   {
                //     after: selectedNodeIds,
                //     before: oldSelectedNodeIds,
                //   },
                //   'undo',
                // );
                pushStack(
                  'select-nodes',
                  {
                    after: selectedNodeIds,
                    before: oldSelectedNodeIds,
                  },
                  graph.getUndoStack(),
                );
              });
          }}
          style={props.style ? props.style : { minHeight: '300px', height: '300px' }}
        />
      ) : (
        <Empty description={emptyMessage} />
      )}
      {annoEdgeDataSources.length > 0 ? (
        <EdgeTable
          edges={annoEdgeDataSources as EdgeAttribute[]}
          selectedKeys={props.selectedEdgeKeys}
          onSelectedRows={(selectedRows: EdgeAttribute[], oldSelectedRows: EdgeAttribute[]) => {
            props.onSelectedEdges &&
              props.onSelectedEdges(selectedRows).then((rows) => {
                const selectedEdgeIds = uniq(selectedRows.map((row) => row.relid));
                const selectedNodeIds = uniq(
                  selectedRows
                    .map((row) => row.source)
                    .concat(selectedRows.map((row) => row.target)),
                );

                const oldSelectedNodeIds = uniq(
                  oldSelectedRows
                    .map((row) => row.source)
                    .concat(oldSelectedRows.map((row) => row.target)),
                );
                const oldSelectedEdgeIds = uniq(oldSelectedRows.map((row) => row.relid));

                if (selectedEdgeIds.length === 0 || !graph || selectedNodeIds.length === 0) {
                  return;
                }

                if (
                  selectedEdgeIds === props.selectedEdgeKeys ||
                  (selectedEdgeIds === oldSelectedEdgeIds && selectedNodeIds === oldSelectedNodeIds)
                ) {
                  // When we enter the table again, the selectedEdgeKeys will be the same as the selectedEdgeIds, so we need to ignore it.
                  return;
                }

                setSelectedGraph({
                  nodes: props.nodeDataSources
                    .filter((node) => selectedNodeIds.includes(node.id))
                    .map((node) => node.metadata) as GraphNode[],
                  edges: selectedRows.map((row) => row.metadata) as GraphEdge[],
                });

                console.log(
                  'onSelectedRows: ',
                  selectedEdgeIds,
                  selectedNodeIds,
                  oldSelectedEdgeIds,
                  oldSelectedNodeIds,
                  graph,
                );
                // graph.pushStack(
                //   'select-edges',
                //   {
                //     after: {
                //       edges: selectedEdgeIds,
                //       nodes: selectedNodeIds,
                //     },
                //     before: {
                //       edges: oldSelectedEdgeIds,
                //       nodes: oldSelectedNodeIds,
                //     },
                //   },
                //   'undo',
                // );
                pushStack(
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
                  graph.getUndoStack(),
                );
              });
          }}
          style={props.style ? props.style : { minHeight: '300px', height: '60vh' }}
        />
      ) : (
        <Empty description={emptyMessage} />
      )}
    </TableTabs>
  );
};

export default memo(GraphTable);
