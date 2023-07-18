import { Graph } from '@antv/g6';

export const prepareGraphData = (
  graph: Graph,
): {
  data: {
    nodes: any[];
    edges: any[];
  };
  layout: any;
  defaultLayout: any;
} => {
  const data = {
    nodes: graph.getNodes().map((node: any) => {
      const n = node.getModel();
      return {
        ...n,
        style: n._initialStyle,
        _initialStyle: n.style,
      };
    }),
    edges: graph.getEdges().map((edge: any) => {
      const e = edge.getModel();
      return {
        ...e,
        style: e._initialStyle,
        _initialStyle: e.style,
      };
    }),
  };

  const layout = graph.get('layout');

  return {
    data: data,
    layout: {
      type: 'preset',
    },
    defaultLayout: layout,
  };
};
