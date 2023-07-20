import type { APIs, RelationStat, NodeEdgeSearchObjectClass, OptionType } from '../typings';

export type LinkedNodesSearcherProps = {
  getEntities: APIs['GetEntitiesFn'];
  getRelationCounts: APIs['GetRelationCountsFn'];
  entityTypes: string[];
  relationStat: RelationStat[];
  onOk?: (searchObj: NodeEdgeSearchObjectClass) => void;
  onCancel?: () => void;
  searchObject?: NodeEdgeSearchObjectClass;
};
