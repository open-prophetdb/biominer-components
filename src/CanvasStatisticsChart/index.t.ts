import type { GraphData } from '../typings';

export type CanvasStatisticsChartProps = {
  /**
   * @description The graph data to be displayed in the chart. The data should be in the format of GraphData which contains two arrays: nodes and edges.
   */
  data: GraphData;
};
