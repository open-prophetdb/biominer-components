import type { APIs, GraphData, GraphNode, GraphEdge } from '../typings';

export type EdgeInfo = {
  startNode: GraphNode;
  endNode: GraphNode;
  edge: GraphEdge;
};

export type KnowledgeGraphProps = {
  postMessage?: (message: any) => void;
  apis: APIs;
  data?: GraphData;
  NodeInfoPanel?: React.ComponentType<{
    node?: GraphNode
  }>;
  EdgeInfoPanel?: React.ComponentType<{
    edgeInfo: EdgeInfo
  }>;
};

export type PromptItem = {
  key: string;
  label: string;
  type: 'node' | 'edge' | 'subgraph';
};
