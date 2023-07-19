import type { GraphNode, GraphEdge } from '../typings';

export type EdgeInfo = {
  startNode: GraphNode;
  endNode: GraphNode;
  edge: GraphEdge;
};

export type EdgeInfoPanelProps = {
  /**
   * @description The information of the edge
   * @default undefined
   */
  edgeInfo?: EdgeInfo;
};
