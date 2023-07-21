import type { Graph, GraphData as AntvGraphData } from '@antv/graphin';
import type {
  GraphHistoryItemPayload,
  GraphHistoryParams,
  GraphHistoryResponse,
} from './GraphStore/typings';

declare module '*.png' {
  const value: any;
  export default value;
}

export type OptionType = {
  order: number;
  label: string;
  value: string;
};

export type OnNodeMenuClickFn = (
  item: { key: string; name: string },
  data: GraphNode,
  graph: Graph,
  graphin: any,
) => void;

export type OnCanvasMenuClickFn = (
  item: { key: string; name: string },
  graph: Graph,
  graphin: any,
) => void;

export type OnEdgeMenuClickFn = (
  item: { key: string; name: string },
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  graph: Graph,
  graphin: any,
) => void;

export type NodeStat = {
  node_type: string;
  node_count: number;
  source: string;
};

export type EdgeStat = {
  source: string;
  relation_type: string;
  start_node_type: string;
  end_node_type: string;
  relation_count: number;
};

export type EdgeInfo = {
  startNode: GraphNode;
  endNode: GraphNode;
  edge: GraphEdge;
};

export type DimensionArray = {
  x: number;
  y: number;
  node_id: string;
  node_type: string;
  raw_node_id: string;
}[];

export type OnClickEdgeFn = (
  edgeId: string,
  startNode: GraphNode,
  endNode: GraphNode,
  edge: GraphEdge,
) => void;

export type OnClickNodeFn = (nodeId: string, node: GraphNode) => void;

export type AdjacencyList = Map<string, string[]>; // node id -> list of node ids
