import type { EntityStat, RelationStat } from '../typings';

export const stat_total_node_count = (stats: EntityStat[]) =>
  stats.reduce((acc, cur) => acc + cur.entity_count, 0);

export const stat_total_relation_count = (stats: RelationStat[]) =>
  stats.reduce((acc, cur) => acc + cur.relation_count, 0);
