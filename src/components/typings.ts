export type EdgeStat = {
  source: string;
  relation_type: string;
  start_node_type: string;
  end_node_type: string;
  relation_count: number;
};

export type EntityQueryParams = {
  /** Query string with json specification. */
  query_str: string;
  /** Page, From 1. */
  page?: number;
  /** Num of items per page. */
  page_size?: number;
};

export type Entity = {
  idx: number;
  id: string;
  name: string;
  label: string;
  resource: string;
  description?: string;
};

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

export type EntityRecordsResponse = {
  /** Total number of records. */
  total: number;
  /** List of records. */
  records: Entity[];
  /** Page number. */
  page: number;
  /** Num of items per page. */
  page_size: number;
};

export type EntityStat = {
  id: number;
  resource: string;
  entity_type: string;
  entity_count: number;
};

export type RelationStat = {
  id: number;
  resource: string;
  relation_type: string;
  relation_count: number;
  start_entity_type: string;
  end_entity_type: string;
};

export type StatisticsResponse = {
  entity_stat: EntityStat[];
  relation_stat: RelationStat[];
};

export type GraphNode = {
  comboId: string;
  id: string;
  label: string;
  nlabel: string;
  cluster: string;
  style: any;
  category: 'node';
  type: 'graphin-circle';
  data: Record<string, any>; // at least id, name
  x?: number;
  y?: number;
};

export type GraphEdge = {
  relid: string;
  source: string;
  category: 'edge';
  target: string;
  reltype: string;
  style: any;
  data: Record<string, any>;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphHistoryItem = {
  description: string;
  payload: Record<string, any>;
  name: string;
  id: string;
  created_time: number;
  db_version: string;
  version: string;
  owner: any;
  parent: string;
};

export type GraphHistoryResponse = {
  total: number;
  page: number;
  page_size: number;
  data: GraphHistoryItem[];
};

export type GraphHistoryParams = {
  page?: number;
  page_size?: number;
  owner?: string;
  db_version?: string;
  version?: string;
};

export type GraphHistoryItemPayload = {
  description?: string;
  payload: Record<string, any>;
  name: string;
  created_time?: number;
  db_version?: string;
  version?: string;
  owner?: any;
  parent?: string;
};

export type GeneInfo = {
  _id: string;
  _version: number;
  entrezgene: number;
  hgnc: number;
  name: string;
  symbol: string;
  taxid: number;
  summary: string;
  type_of_gene: string;
  ensembl: {
    gene: string;
    transcript: string[];
    protein: string[];
    translation: string[];
  };
  genomic_pos: {
    chr: string;
    start: number;
    end: number;
    strand: number;
  };
};

export type GetItems4GenePanelFn = (info: GeneInfo, exclude: any[]) => any[];

export type GetGeneInfoFn = (geneId: string) => Promise<GeneInfo>;

// ------------------ APIs ------------------
export type APIs = {
  GetStatisticsFn: () => Promise<{
    entity_stat: EntityStat[];
    relation_stat: RelationStat[];
  }>;
  GetEntitiesFn: (params: EntityQueryParams) => Promise<EntityRecordsResponse>;
  // Graph History
  GetGraphHistoryFn: (params: GraphHistoryParams) => Promise<GraphHistoryResponse>;
  PostGraphHistoryFn: (payload: GraphHistoryItemPayload) => Promise<GraphHistoryItemPayload>;
  DeleteGraphHistoryFn: (params: { id: number }) => Promise<void>;
  // Prediction
  GetNodesFn: (params: { node_ids: string[] }) => Promise<GraphData>;
  GetSimilarityNodesFn: (params: {
    node_id: string;
    query_str: string;
    topk: number;
  }) => Promise<GraphData>;
  GetOneStepLinkedNodesFn: (params: EntityQueryParams) => Promise<GraphData>;
  GetConnectedNodesFn: (params: { node_ids: string[] }) => Promise<GraphData>;
  GetEntity2DFn: (params: EntityQueryParams) => Promise<GraphData>;
};

// ------------------ Search Object ------------------
// The SearchObject interface is used to process the search object from the frontend.
interface SearchObjectInterface {
  process(apis: APIs): GraphData;
}

// Allow to query the linked nodes and related edges of a node, these nodes may connect with the node by one or several hops.
type NodeEdgeSearchObject = {
  entity_type: string;
  entity_id: string;
  relation_types?: string[];
  nsteps?: number;
  limit?: number;
};

export class NodeEdgeSearchObjectClass implements SearchObjectInterface {
  data: NodeEdgeSearchObject;

  constructor(data: NodeEdgeSearchObject) {
    this.data = data;
  }

  process(apis: APIs): GraphData {
    // Not implemented yet.
    return { nodes: [], edges: [] };
  }
}

// Allow to query a set of nodes and related edges if the enableAutoConnection is turned on.
type NodesSearchObject = {
  // The order of the entities must match the order of the entity_types.
  entity_ids: string[];
  entity_types: string[];
  enableAutoConnection?: boolean;
};

export class NodesSearchObjectClass implements SearchObjectInterface {
  data: NodesSearchObject;

  constructor(data: NodesSearchObject) {
    this.data = data;
  }

  process(apis: APIs): GraphData {
    // Not implemented yet.
    return { nodes: [], edges: [] };
  }
}

// Allow to predict the edges between two nodes.
type SimilaritySearchObject = {
  entity_id: string;
  entity_type: string;
  topk?: number;
};

export class SimilaritySearchObjectClass implements SearchObjectInterface {
  data: SimilaritySearchObject;

  constructor(data: SimilaritySearchObject) {
    this.data = data;
  }

  process(apis: APIs): GraphData {
    // Not implemented yet.
    return { nodes: [], edges: [] };
  }
}

type PathSearchObject = {
  source_entity_id: string;
  source_entity_type: string;
  target_entity_id: string;
  target_entity_type: string;
  relation_types?: string[];
  nsteps?: number;
};

export class PathSearchObjectClass implements SearchObjectInterface {
  data: PathSearchObject;

  constructor(data: PathSearchObject) {
    this.data = data;
  }

  process(apis: APIs): GraphData {
    // Not implemented yet.
    return { nodes: [], edges: [] };
  }
}

export type SearchObject = {
  merge_mode: 'append' | 'replace' | 'subtract';
  search_object:
    | NodeEdgeSearchObject
    | NodesSearchObject
    | SimilaritySearchObject
    | PathSearchObject;
};
