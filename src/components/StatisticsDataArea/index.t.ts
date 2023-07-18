export type StatisticsData = {
  numNodes: number;
  numEdges: number;
  numAllNodes: number;
  numAllEdges: number;
  isDirty: boolean;
  currentParentUUID: string;
};

export type StatisticsDataAreaProps = {
  data: StatisticsData;
  style?: any;
};
