export type EntityStat = {
  id: number;
  resource: string;
  entity_type: string;
  entity_count: number;
};

export const stat_total_node_count = (stats: EntityStat[]) =>
  stats.reduce((acc, cur) => acc + cur.entity_count, 0);

export const stat_total_relation_count = (stats: RelationStat[]) =>
  stats.reduce((acc, cur) => acc + cur.relation_count, 0);

export type RelationStat = {
  id: number;
  resource: string;
  relation_type: string;
  relation_count: number;
  start_entity_type: string;
  end_entity_type: string;
};

export type StatisticsChartProps = {
  /**
   * @description The statistics data of entities.
   * @default []
   */
  nodeStat: EntityStat[];
  /**
   * @description The statistics data of relations.
   * @default []
   */
  edgeStat: RelationStat[];
};
