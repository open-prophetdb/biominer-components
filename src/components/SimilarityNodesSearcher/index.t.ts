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
  target_entity_types?: string[];
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
    return `${this.data.entity_id}${COMPOSED_ENTITY_DELIMITER}${this.data.entity_type}`;
  }

  process(apis: APIs): Promise<GraphData> {
    let query = undefined;
    if (!this.data.target_entity_types || this.data.target_entity_types.length === 0) {
      query = undefined;
    } else {
      query = {
        operator: 'in',
        value: this.data.target_entity_types,
        field: 'entity_type',
      };
    }

    let params: any = {
      node_id: `${this.data.entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.entity_id}`,
      topk: this.data.topk || 10,
    };

    if (query) {
      params['query_str'] = JSON.stringify(query);
    }

    return apis.GetSimilarityNodesFn(params);
  }
}
