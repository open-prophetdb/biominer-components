import type { Graph, GraphData as AntvGraphData } from '@antv/graphin';
import type { Layout, GraphNode, GraphEdge } from '../typings';
import type { GraphHistoryParams, GraphHistoryResponse } from './GraphStore/typings';

export type ExpandedGraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentUUID: string;
  isDirty: boolean;
  layout: Layout;
};

declare module '*.png' {
  const value: any;
  export default value;
}

export type OptionType = {
  order: number;
  label: string;
  value: string;
};

export type MenuItem = {
  key: string;
  label: string;
  hidden?: boolean;
  danger?: boolean;
  children?: MenuItem[];
  icon: string | React.ReactNode;
  handler?: (node: GraphNode, graph?: Graph, apis?: ApisType) => void;
};

export type CanvasMenuItem = {
  key: string;
  label: string;
  hidden?: boolean;
  danger?: boolean;
  icon: string | React.Element;
  handler?: (item: CanvasMenuItem, graph?: Graph, apis?: ApisType) => void;
};

export type NodeBadge = {
  position: 'RT' | 'RB' | 'LT' | 'LB';
  type: 'text';
  value: number | string;
  size: [15, 15];
  fill: string;
  color: '#fff';
};

export type OnNodeMenuClickFn = (
  item: MenuItem,
  data: GraphNode,
  graph: Graph,
  graphin: any,
) => void;

export type OnCanvasMenuClickFn = (item: CanvasMenuItem, graph: Graph, graphin: any) => void;

export type OnEdgeMenuClickFn = (
  item: MenuItem,
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
