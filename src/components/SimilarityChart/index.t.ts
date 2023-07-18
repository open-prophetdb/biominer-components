export type Entity2D = {
  entity_id: string;
  entity_name: string;
  entity_type: string;
  umap_x?: number;
  umap_y?: number;
  tsne_x?: number;
  tsne_y?: number;
  color?: string;
};

export type SimilarityChartProps = {
  selectedNodeIds?: string[];
  description?: string;
  onClick?: (entity2d: Entity2D) => void;
  data: Entity2D[];
  method: 'umap' | 'tsne';
};
