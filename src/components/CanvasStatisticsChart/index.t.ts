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

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type CanvasStatisticsChartProps = {
  /**
   * @description The graph data to be displayed in the chart. The data should be in the format of GraphData which contains two arrays: nodes and edges.
   */
  data: GraphData;
};
