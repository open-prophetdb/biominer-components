import type { SearchObject } from '../typings';

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
