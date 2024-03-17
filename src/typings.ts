export interface LayoutOptionConfig {
  key: string;
  title: string;
  defaultValue?: number | string | boolean;
  component: 'switch' | 'slider' | 'input' | 'select' | 'text';
  description?: string;

  /** 仅 select 时候有效，枚举值 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enums?: any[];

  /** 仅 slider 和input 的时候有效 */
  max?: number;
  min?: number;
  step?: number;
}

export type LayoutConfig = {
  type: string;
  title: string;
  hidden?: boolean;
  options?: LayoutOptionConfig[];
};

export type Layout = {
  type?: string;
  options?: Record<string, number | string | boolean | string[] | number[]>;
  width?: number;
  height?: number;
  matrix?: number[][];
};

export type OptionType = {
  order: number;
  label: string;
  value: string;
  description?: string;
  metadata?: any;
};

export type QueryItem = {
  operator: string;
  field: string;
  value: string | number | boolean | string[] | number[] | boolean[];
};

export type ComposeQueryItem = {
  operator: string; // AND, OR, NOT
  items: (QueryItem | ComposeQueryItem)[];
};

export type EntityQueryParams = {
  /** Query string with json specification. */
  query_str: string;
  /** A prefix for the model table, such as biomedgps */
  model_table_prefix?: string;
  /** Page, From 1. */
  page?: number;
  /** Num of items per page. */
  page_size?: number;
};

export type RelationQueryParams = EntityQueryParams;

export type Entity = {
  idx: number;
  id: string;
  name: string;
  label: string;
  resource: string;
  description?: string;
  taxid?: string;
  synonyms?: string;
  xrefs?: string;
  pmid?: string;
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

export type Entity2DRecordsResponse = {
  /** Total number of records. */
  total: number;
  /** List of records. */
  records: Entity2D[];
  /** Page number. */
  page: number;
  /** Num of items per page. */
  page_size: number;
};

export type Relation = {
  id: number;
  relation_type: string;
  source_id: string;
  target_id: string;
  source_type: string;
  target_type: string;
  resource: string;
  key_sentence?: string;
  score?: number;
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

export type RelationRecordsResponse = {
  /** Total number of records. */
  total: number;
  /** List of records. */
  records: Relation[];
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
  description?: string;
};

export type RelationCount = {
  relation_type: string;
  source_type: string;
  target_type: string;
  resource: string;
  ncount: number;
};

export type StatisticsResponse = {
  entity_stat: EntityStat[];
  relation_stat: RelationStat[];
};

type Label = {
  value: string;
  fill: string;
  fontSize: number;
  offset: number;
  position: string;
};

type Icon = {
  type: string;
  value: string;
  fill: string;
  size: number;
  color: string;
};

type NodeData = {
  identity: string;
  id: string;
  label: string;
  name: string;
  description?: string;
  resource: string;
  xrefs?: string;
  taxid?: string;
  synonyms?: string;
  pmid?: string;
};

type NodeKeyShape = {
  fill: string;
  stroke: string;
  opacity: number;
  fillOpacity: number;
};

type NodeStyle = {
  label: Label;
  keyshape: NodeKeyShape;
  icon: Icon;
};

export type GraphNode = {
  comboId?: string;
  id: string;
  label: string;
  nlabel: string;
  degree?: number;
  style: NodeStyle;
  category: string;
  cluster?: string;
  type: string;
  x?: number;
  y?: number;
  data: NodeData;
};

export type GraphEdge = {
  relid: string;
  source: string;
  category: string;
  target: string;
  reltype: string;
  style: EdgeStyle;
  data: EdgeData;
  // Only for explaining the relation type.
  description?: string;
  // Only for labeling several edges between two nodes.
  multiple?: boolean;
};

type EdgeData = {
  relation_type: string;
  source_id: string;
  source_type: string;
  target_id: string;
  target_type: string;
  score: number;
  key_sentence: string;
  resource: string;
};

type EdgeKeyShape = {
  lineDash: number[];
  stroke: string;
  lineWidth: number;
};

type EdgeLabel = {
  value: string;
};

type EdgeStyle = {
  label: EdgeLabel;
  keyshape?: EdgeKeyShape;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphHistoryItem = {
  description?: string;
  payload: string;
  name: string;
  id: string;
  created_time: string;
  db_version: string;
  version: string;
  owner: string;
  parent?: string;
};

export type GraphHistoryResponse = {
  total: number;
  page: number;
  page_size: number;
  records: GraphHistoryItem[];
};

export type GraphHistoryParams = {
  page?: number;
  page_size?: number;
  owner?: string;
  db_version?: string;
  version?: string;
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

export const COMPOSED_ENTITY_DELIMITER = '::';

export type ExpandedRelation = {
  relation: Relation;
  source: Entity;
  target: Entity;
};

export type SubgraphWithCtx = {
  context_str: string;
  subgraph: string;
};

export type LlmResponse = { prompt: string; response: string; created_at: number };

export type SharedNodesParams = {
  start_node_id?: string;
  node_ids: string;
  nhops?: number;
  topk?: number;
  target_node_types?: string; // Separated by comma, such as "Gene,Disease"
  nums_shared_by?: number;
};

export type PromptItem = {
  key: string;
  label: string;
  type: 'subgraph' | 'node' | 'edge';
};

export type Publication = {
  authors?: string[];
  citation_count?: number;
  summary: string;
  journal: string;
  title: string;
  year?: number;
  doc_id: string;
};

export type PublicationDetail = {
  authors?: string[];
  citation_count?: number;
  summary: string;
  journal: string;
  title: string;
  year?: number;
  doc_id: string;
  article_abstract?: string;
  doi?: string;
  provider_url?: string;
};

export type Publications = {
  records: Publication[];
  page: number;
  total: number;
  page_size: number;
};

// ------------------ APIs ------------------
export type APIs = {
  GetStatisticsFn: () => Promise<{
    entity_stat: EntityStat[];
    relation_stat: RelationStat[];
  }>;
  GetEntitiesFn: (params: EntityQueryParams) => Promise<EntityRecordsResponse>;
  GetRelationsFn: (params: RelationQueryParams) => Promise<RelationRecordsResponse>;
  GetRelationCountsFn: (params: RelationQueryParams) => Promise<RelationCount[]>;
  // Graph History
  GetGraphHistoryFn: (params: GraphHistoryParams) => Promise<GraphHistoryResponse>;
  PostGraphHistoryFn: (payload: GraphHistoryItem) => Promise<GraphHistoryItem>;
  DeleteGraphHistoryFn: (params: { id: string }) => Promise<void>;
  // Prediction
  GetNodesFn: (params: { node_ids: string }) => Promise<GraphData>;
  GetPredictedNodesFn: (params: {
    node_id: string;
    relation_type: string;
    query_str: string;
    topk: number;
  }) => Promise<GraphData>;
  GetOneStepLinkedNodesFn: (params: EntityQueryParams) => Promise<GraphData>;
  GetNStepsLinkedNodesFn: (params: {
    start_node_id: string; // Gene::ENTREZ:1234
    end_node_id: string;
    nhops?: number;
  }) => Promise<GraphData>;
  GetConnectedNodesFn: (params: { node_ids: string }) => Promise<GraphData>;
  GetEntity2DFn: (params: EntityQueryParams) => Promise<Entity2DRecordsResponse>;
  GetEntityColorMapFn: () => Promise<Record<string, string>>;
  AskLlmFn?: (
    params: { prompt_template_id: string },
    body: {
      entity?: NodeData;
      expanded_relation?: ExpandedRelation;
      subgraph_with_ctx?: SubgraphWithCtx;
    },
  ) => Promise<LlmResponse>;
  GetSharedNodesFn: (params: SharedNodesParams) => Promise<GraphData>;
  GetPromptsFn?: () => Promise<{
    records: PromptItem[];
    total: number;
    page: number;
    page_size: number;
  }>;
  GetPublicationsFn?: (query_str: string, page?: number, page_size?: number) => Promise<Publications>;
  GetPublicationFn?: (doc_id: string) => Promise<PublicationDetail>;
};

// ------------------ Search Object ------------------
// The SearchObject interface is used to process the search object from the frontend.
// You can define any search object you want in any component, and implement the process function to process the search object.
// Best practice is to define a class for each search object, and implement the process function in the class. You can define the class in the component's index.t.ts file and use it in the component.
// An example is in the src/components/LinkedNodesSearcher/index.t.ts file.
export type MergeMode = 'append' | 'replace' | 'subtract';
export interface SearchObjectInterface {
  process(apis: APIs): Promise<GraphData>;

  get_current_node_id(): string | undefined;

  get_instance_id(): string;

  data: any;

  merge_mode: MergeMode;
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
  merge_mode: MergeMode;

  constructor(data: PathSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_instance_id(): string {
    return `path-search-object`;
  }

  get_current_node_id(): string {
    return `${this.data.source_entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.source_entity_id}`;
  }

  get_target_node_id(): string {
    return `${this.data.target_entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.target_entity_id}`;
  }

  get_source_node_id(): string {
    return `${this.data.source_entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.source_entity_id}`;
  }

  process(apis: APIs): Promise<GraphData> {
    if (this.data.source_entity_id && this.data.target_entity_id) {
      return apis.GetNStepsLinkedNodesFn({
        start_node_id: this.get_source_node_id(),
        end_node_id: this.get_target_node_id(),
        nhops: this.data.nsteps,
      });
    } else {
      return new Promise((resolve, reject) => {
        reject('The source_entity_id and target_entity_id must be set.');
      });
    }
  }
}

export const MergeModeOptions = [
  { label: 'Replace', value: 'replace' },
  { label: 'Append', value: 'append' },
  { label: 'Subtract', value: 'subtract' },
];
