// Allow to query the linked nodes and related edges of a node, these nodes may connect with the node by one or several hops.
export type NodeEdgeSearchObject = {
  entity_type: string;
  entity_id: string;
  relation_types?: string[];
  nsteps?: number;
  limit?: number;
};

// Allow to query a set of nodes and related edges if the enableAutoConnection is turned on.
export type NodesSearchObject = {
  // The order of the entities must match the order of the entity_types.
  entity_ids: string[];
  entity_types: string[];
  enableAutoConnection?: boolean;
};

// Allow to predict the edges between two nodes.
export type SimilaritySearchObject = {
  entity_id: string;
  entity_type: string;
  topk?: number;
};

export type PathSearchObject = {
  source_entity_id: string;
  source_entity_type: string;
  target_entity_id: string;
  target_entity_type: string;
  relation_types?: string[];
  nsteps?: number;
};

export type SearchObject = {
  merge_mode: 'append' | 'replace' | 'subtract';
  search_object:
    | NodeEdgeSearchObject
    | NodesSearchObject
    | SimilaritySearchObject
    | PathSearchObject;
};

export interface DataType {
  key: string;
  node_id: string;
  node_type: string;
  matched_id?: string;
  matched_name?: string;
  disabled?: boolean;
}

export type TransferTableProps = {
  dataSource: DataType[];
  onCancel?: () => void;
  onOk?: (searchObj: SearchObject) => void;
};
