import {
  type APIs,
  type SearchObjectInterface,
  type GraphData,
  type MergeMode,
  type GraphNode,
  COMPOSED_ENTITY_DELIMITER,
} from '../typings';

export type SharedNodesSearcherProps = {
  /**
   * @description A function to get the entities.
   */
  getSharedNodes: APIs['GetSharedNodesFn'];
  /**
   * @description All the entity types that stored in the database.
   */
  entityTypes: string[];
  /**
   * @description A listener to listen the submit event.
   * @default undefined
   */
  onOk?: (searchObj: SharedNodesSearchObjectClass) => void;
  /**
   * @description A listener to listen the cancel event.
   * @default undefined
   */
  onCancel?: () => void;
  /**
   * @description A initial search object.
   * @default undefined
   */
  searchObject?: SharedNodesSearchObjectClass;
};

// Allow to predict the edges between two nodes.
type SharedNodesSearchObject = {
  start_node_id?: string;
  nodes: GraphNode[];
  node_types?: string[];
  topk?: number;
  nhops?: number;
  nums_shared_by?: number;
};

export class SharedNodesSearchObjectClass implements SearchObjectInterface {
  data: SharedNodesSearchObject;
  merge_mode: MergeMode;

  constructor(data: SharedNodesSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_instance_id(): string {
    return `shared-nodes-search-object`;
  }

  get_current_node_id(): string | undefined {
    if (this.data.start_node_id) return this.data.start_node_id;

    if (this.data.nodes.length === 0) return undefined;
    let node = this.data.nodes[0];
    return `${node.data.label}${COMPOSED_ENTITY_DELIMITER}${node.data.id}`;
  }

  process(apis: APIs): Promise<GraphData> {
    // TODO: Do we need a query for narrowing down the search?
    let query = undefined;

    let params: any = {
      // NOTE: the node id is in the format of `label${COMPOSED_ENTITY_DELIMITER}id`
      start_node_id: this.data.start_node_id,
      node_ids: this.data.nodes
        .map((node) => `${node.data.label}${COMPOSED_ENTITY_DELIMITER}${node.data.id}`)
        .join(','),
      target_node_types: this.data.node_types?.join(','),
      topk: this.data.topk || 10,
      nhops: this.data.nhops || 1,
      nums_shared_by: this.data.nums_shared_by || this.data.nodes.length,
    };

    if (query) {
      params['query_str'] = JSON.stringify(query);
    }

    return apis.GetSharedNodesFn(params);
  }
}
