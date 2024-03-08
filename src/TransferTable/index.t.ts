import type { MergeMode, SearchObjectInterface, GraphData, APIs } from '../typings';
import { joinNodeIds } from '../utils';
// import { message } from 'antd';

// Allow to query a set of nodes and related edges if the enableAutoConnection is turned on.
type NodesSearchObject = {
  // The order of the entities must match the order of the entity_types.
  entity_ids: string[];
  entity_types: string[];
  enableAutoConnection?: boolean;
};

export class NodesSearchObjectClass implements SearchObjectInterface {
  data: NodesSearchObject;
  merge_mode: MergeMode;

  constructor(data: NodesSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_current_node_id(): string | undefined {
    return undefined;
  }

  get_instance_id(): string {
    return `nodes-search-object`;
  }

  process(apis: APIs): Promise<GraphData> {
    if (
      !this.data.enableAutoConnection &&
      this.data.entity_ids.length == this.data.entity_types.length
    ) {
      return apis.GetConnectedNodesFn({
        node_ids: joinNodeIds(this.data.entity_ids, this.data.entity_types),
      });
    }

    if (this.data.enableAutoConnection) {
      return new Promise((resolve, reject) => {
        // message.error('Not implemented yet.');
        console.log('NodeSearchObjectClass: Not implemented yet.');
        resolve({ nodes: [], edges: [] });
      });
    }

    return new Promise((resolve, reject) => {
      reject('The length of entity_ids and entity_types must be equal.');
    });
  }
}

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
  onOk?: (searchObj: NodesSearchObjectClass) => void;
};
