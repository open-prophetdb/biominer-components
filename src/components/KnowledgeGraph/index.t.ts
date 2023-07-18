import { GetGeneInfoFn, GetItems4GenePanelFn } from './NodeInfoPanel/typings';

// ------------------ APIs ------------------
export type NodeTypesResponse = {
  node_types?: string[];
};

export type LabelParams = {
  query_str: string;
  label_type: string;
};

export type Label = {
  id: string;
  name: string;
};

export type LabelResponse = {
  total: number;
  page: number;
  page_size: number;
  data: Label[];
};

export type RelationshipParams = {
  page?: number;
  page_size?: number;
  query_str: string;
  only_total?: boolean;
  disable_total?: 'true' | 'false';
};

export type Relationship = {
  id: string;
  relationship_type: string;
  resource: string;
  source_type: string;
  target_type: string;
  ncount: number;
};

export type RelationshipResponse = {
  total: number;
  page: number;
  page_size: number;
  data: Relationship[];
};

export type GraphPayload = {
  source_id?: string;
  relation_types?: string[];
  topk?: number;
  enable_prediction?: boolean;
  // TODO: we need to replace match, where, return clauses with more secure way
  query_map?: Record<string, any>;
  target_ids?: string[];
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type SimilarityPayload = {
  source_id?: string;
  topk?: number;
  source_type?: string;
  target_ids?: string[];
  target_types?: string[];
};

export type DimensionPayload = {
  source_id?: string;
  source_type?: string;
  target_ids?: string[];
  target_types?: string[];
};

export type DimensionResponse = {
  data: DimensionArray;
};

export type GraphHistoryResponse = {
  total: number;
  page: number;
  page_size: number;
  data: GraphItem[];
};

export type APIs = {
  GetStatisticsFn: (options?: { [key: string]: any }) => Promise<{
    entity_stat: EntityStat[];
    relation_stat: RelationStat[];
  }>;
  // Graph History
  GetGraphHistoryFn: (params: GraphHistoryParams) => Promise<GraphHistoryResponse>;
  PostGraphHistoryFn: (payload: GraphHistoryItemPayload) => Promise<{ id: { id?: string } }>;
  DeleteGraphHistoryFn: (params: { id: string }) => Promise<void>;
  // Graph Metadata
  GetNodeTypesFn: () => Promise<NodeTypesResponse>;
  GetLabelsFn: (params: LabelParams) => Promise<LabelResponse>;
  GetRelationshipsFn: (params: RelationshipParams) => Promise<RelationshipResponse>;
  // Graph
  PostGraphFn: (payload: GraphPayload) => Promise<GraphResponse>;
  // Prediction
  PostSimilarityFn: (payload: SimilarityPayload) => Promise<GraphResponse>;
  PostDimensionReductionFn: (payload: DimensionPayload) => Promise<DimensionResponse>;
};

export type KnowledgeGraphProps = {
  postMessage?: (message: any) => void;
  apis: APIs;
  getGeneInfo?: GetGeneInfoFn;
  getItems4GenePanel?: GetItems4GenePanelFn;
};
