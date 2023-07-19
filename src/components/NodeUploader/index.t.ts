export interface DataType {
  key: string;
  node_id: string;
  node_type: string;
  matched_id?: string;
  matched_name?: string;
  disabled?: boolean;
}

export type QueryParams = {
  query_str?: string;
  page?: number;
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

export type EntityRecordsResponse = {
  total: number;
  records: Entity[];
  page: number;
  page_size: number;
};

export interface NodeUploaderProps {
  /**
   * @description A function that returns a promise that resolves to an array of entities. It is used to fetch entities that match the query string.
   */
  getEntities: (queryParams: QueryParams) => Promise<EntityRecordsResponse>;
  /**
   * @description A listener that is called when the user clicks the upload button. It is passed an array of data that the user has selected.
   */
  onUpload?: (data: DataType[]) => void;
}
