import React, { useState, useContext, useEffect, memo } from 'react';
import { Empty } from 'antd';
import NodeTable from '../../NodeTable';
import EdgeTable from '../../EdgeTable';
import TableTabs from './TableTabs';
import type { SimpleNode } from '../../EdgeTable';
import type { NodeAttribute } from '../../NodeTable/index.t';
import type { EdgeAttribute } from '../../EdgeTable/index.t';
import { CustomGraphinContext } from '../../Context/CustomGraphinContext';
import type { GraphData, GraphEdge, GraphNode, RelationStat } from '../../typings';
import { uniq } from 'lodash';

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
  onDeletedEdges?: (deletedRows: EdgeAttribute[], deletedNodes: SimpleNode[]) => Promise<void>;
  edgeStat?: RelationStat[];
  // To generate an attention subgraph which contains the selected edge, its related two nodes and the top 10 nodes which have the higher score with the two nodes.
  onExplainRow?: (row: EdgeAttribute) => void;
}

const GraphTable: React.FC<GraphTableProps> = (props) => {
  const { graph } = useContext(CustomGraphinContext);
  const emptyMessage = props.emptyMessage || 'No data';
  const [annoEdgeDataSources, setAnnoEdgeDataSources] = useState<EdgeAttribute[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const filterGraph = (selectedNodeIds: string[], selectedEdgeIds: string[]) => {
    const nodes = props.nodeDataSources
      .filter((node) => selectedNodeIds.includes(node.id))
      .map((node) => node.metadata);
    const edges = props.edgeDataSources
      .filter((edge) => selectedEdgeIds.includes(edge.relid))
      .map((edge) => edge.metadata);

    return {
      nodes: nodes as GraphNode[],
      edges: edges as GraphEdge[],
    };
  };

  const removeNodes = (selectedNodeIds: string[]) => {
    const nodes = props.nodeDataSources
      .filter((node) => !selectedNodeIds.includes(node.id))
      .map((node) => node.metadata);
    const edges = props.edgeDataSources
      .filter(
        (edge) => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target),
      )
      .map((edge) => edge.metadata);

    return {
      nodes: nodes as GraphNode[],
      edges: edges as GraphEdge[],
    };
  };

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

      if (!sourceNode || !targetNode) {
        return;
      }

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
          key={props.nodeDataSources.map((node) => node.id).join(',')}
          nodes={props.nodeDataSources as NodeAttribute[]}
          selectedKeys={props.selectedNodeKeys}
          onSelectedRows={(selectedRows: NodeAttribute[], oldSelectedRows: NodeAttribute[]) => {
            const selectedNodeIds = uniq(selectedRows.map((row) => row.id));
            const oldSelectedNodeIds = uniq(oldSelectedRows.map((row) => row.id));
            if (selectedNodeIds.length === 0 || !graph) {
              return;
            }

            const g = filterGraph(selectedNodeIds, []);
            console.log('selectedRows: ', selectedRows, oldSelectedRows, g);
            setSelectedGraph(g);

            props.onSelectedNodes &&
              props.onSelectedNodes(selectedRows).then((rows) => {
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
              });
          }}
          style={props.style ? props.style : { minHeight: '300px', height: '300px' }}
        />
      ) : (
        <Empty description={emptyMessage} />
      )}
      {annoEdgeDataSources.length > 0 ? (
        <EdgeTable
          edgeStat={props.edgeStat}
          edges={annoEdgeDataSources as EdgeAttribute[]}
          selectedKeys={props.selectedEdgeKeys}
          onExplainRow={props.onExplainRow}
          onSelectedRows={(selectedRows: EdgeAttribute[], oldSelectedRows: EdgeAttribute[]) => {
            const selectedEdgeIds = uniq(selectedRows.map((row) => row.relid));
            const selectedNodeIds = uniq(
              selectedRows.map((row) => row.source).concat(selectedRows.map((row) => row.target)),
            );

            const g = filterGraph(selectedNodeIds, selectedEdgeIds);
            console.log('selectedRows: ', selectedRows, oldSelectedRows, g);
            setSelectedGraph(g);

            props.onSelectedEdges &&
              props.onSelectedEdges(selectedRows).then((rows) => {
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

                console.log(
                  'onSelectedRows: ',
                  selectedEdgeIds,
                  selectedNodeIds,
                  oldSelectedEdgeIds,
                  oldSelectedNodeIds,
                  graph,
                );
              });
          }}
          onDeletedRows={(deletedRows: EdgeAttribute[], deletedNodes: SimpleNode[]) => {
            const g = graph?.save();
            props.onDeletedEdges && props.onDeletedEdges(deletedRows, deletedNodes).then((rows) => {
              if (!graph) {
                return;
              }
            }).catch((err) => {
              console.error('onDeletedEdges error: ', err);
            })
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
