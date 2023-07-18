export type GraphNode = {
  comboId: string;
  id: string;
  label: string;
  nlabel: string;
  cluster: string;
  style: any;
  category: 'node';
  type: 'graphin-circle';
  data: Record<string, any>; // at least id, name
  x?: number;
  y?: number;
};

export type GraphEdge = {
  relid: string;
  source: string;
  category: 'edge';
  target: string;
  reltype: string;
  style: any;
  data: Record<string, any>;
};

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
