import type { Entity2D } from '../typings';

export type SimilarityChartProps = {
  selectedNodeIds?: string[];
  description?: string;
  onClick?: (entity2d: Entity2D) => void;
  data: Entity2D[];
  method: 'umap' | 'tsne';
};
