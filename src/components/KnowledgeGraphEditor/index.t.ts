import type { GetEntitiesFn, GetStatistics, GraphEdge, DeleteKnowledgeByIdFn } from './typings';

export type KnowledgeGetterParams = {
  /** Query string with json specification. */
  query_str?: string;
  /** Page, From 1. */
  page?: number;
  /** Num of items per page. */
  page_size?: number;
};

export type Knowledge = GraphEdge;

export type KnowledgeRecordsResponse = {
  /** Total number of records. */
  total: number;
  /** List of records. */
  records: Knowledge[];
  /** Page number. */
  page: number;
  /** Num of items per page. */
  page_size: number;
};

export type PostKnowledgeFn = (data: Knowledge) => Promise<Knowledge>;

export type PutKnowledgeByIdFn = (id: number, data: Knowledge) => Promise<Knowledge>;

export type GetKnowledgesFn = (params: KnowledgeGetterParams) => Promise<KnowledgeRecordsResponse>;

export type KnowledgeGraphEditorProps = {
  getEntities: GetEntitiesFn;
  getStatistics: GetStatistics;
  getKnowledges: GetKnowledgesFn;
  postKnowledge?: PostKnowledgeFn;
  putKnowledgeById?: PutKnowledgeByIdFn;
  deleteKnowledgeById?: DeleteKnowledgeByIdFn;
};
