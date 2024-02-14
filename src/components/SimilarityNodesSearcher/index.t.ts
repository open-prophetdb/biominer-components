import {
  type APIs,
  type SearchObjectInterface,
  type GraphData,
  type MergeMode,
  type RelationStat,
  COMPOSED_ENTITY_DELIMITER,
} from '../typings';

export type SimilarityNodesSearcherProps = {
  /**
   * @description A function to get the entities.
   */
  getEntities: APIs['GetEntitiesFn'];
  /**
   * @description All the entity types that stored in the database.
   */
  entityTypes: string[];
  /**
   * @description All the statistics of the relations.
   */
  relationStat: RelationStat[];
  /**
   * @description A listener to listen the submit event.
   * @default undefined
   */
  onOk?: (searchObj: SimilarityNodesSearchObjectClass) => void;
  /**
   * @description A listener to listen the cancel event.
   * @default undefined
   */
  onCancel?: () => void;
  /**
   * @description A initial search object.
   * @default undefined
   */
  searchObject?: SimilarityNodesSearchObjectClass;
};

// Allow to predict the edges between two nodes.
type SimilarityNodesSearchObject = {
  entity_id: string;
  entity_type: string;
  relation_type: string;
  topk?: number;
};

export class SimilarityNodesSearchObjectClass implements SearchObjectInterface {
  data: SimilarityNodesSearchObject;
  merge_mode: MergeMode;

  constructor(data: SimilarityNodesSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_instance_id(): string {
    return `similarity-nodes-search-object`;
  }

  get_current_node_id(): string | undefined {
    return `${this.data.entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.entity_id}`;
  }

  process(apis: APIs): Promise<GraphData> {
    // TODO: Do we need a query for narrowing down the search?
    let query = undefined;

    let params: any = {
      node_id: `${this.data.entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.entity_id}`,
      relation_type: `${this.data.relation_type}`,
      topk: this.data.topk || 10,
    };

    if (query) {
      params['query_str'] = JSON.stringify(query);
    }

    return apis.GetSimilarityNodesFn(params);
  }
}
