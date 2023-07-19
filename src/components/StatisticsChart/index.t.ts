import type { EntityStat, RelationStat } from '../typings';

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
