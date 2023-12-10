import type {
  RelationStat,
  OptionType,
  Entity,
  QueryItem,
  ComposeQueryItem,
  APIs,
} from './typings';
import { filter } from 'lodash';
import { COMPOSED_ENTITY_DELIMITER } from './typings';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const getJwtAccessToken = (): string | null => {
  let jwtToken = null;
  // Check if the cookie exists
  if (document.cookie && document.cookie.includes('jwt_access_token=')) {
    // Retrieve the cookie value
    // @ts-ignore
    jwtToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('jwt_access_token='))
      .split('=')[1];
  }

  if (jwtToken) {
    console.log('JWT access token found in the cookie.');
    return jwtToken;
  } else {
    console.log('JWT access token not found in the cookie.');
    return null;
  }
};

export const getIdentity = async () => {
  const jwtAccessToken = getJwtAccessToken();

  if (jwtAccessToken) {
    // Don't set a identity and let the backend get identity from an access key.
    return null;
  } else {
    let visitorId = localStorage.getItem('rapex-visitor-id');

    if (!visitorId) {
      const fpPromise = FingerprintJS.load();
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();

      visitorId = result.visitorId;
    }

    return visitorId;
  }
};

export const formatNodeId = (entityId: string, entityType: string): string => {
  return `${entityType}${COMPOSED_ENTITY_DELIMITER}${entityId}`;
};

export const parseNodeId = (nodeId: string): { entityType: string; entityId: string } => {
  const [entityType, entityId] = nodeId.split(COMPOSED_ENTITY_DELIMITER);
  return {
    entityType,
    entityId,
  };
};

export const parseNodeIds = (nodeIds: string[]): { entityIds: string[]; entityTypes: string[] } => {
  const entityIds = [];
  const entityTypes = [];
  for (let i = 0; i < nodeIds.length; i++) {
    const { entityType, entityId } = parseNodeId(nodeIds[i]);
    entityIds.push(entityId);
    entityTypes.push(entityType);
  }

  return {
    entityIds,
    entityTypes,
  };
};

export const formatNodeIds = (entityIds: string[], entityTypes: string[]): string[] => {
  const nodeIds = [];
  for (let i = 0; i < entityIds.length; i++) {
    nodeIds.push(formatNodeId(entityIds[i], entityTypes[i]));
  }

  return nodeIds;
};

export const joinNodeIds = (
  entityIds: string[],
  entityTypes: string[],
  delemiter?: ',' | ';',
): string => {
  const nodeIds = formatNodeIds(entityIds, entityTypes);
  return nodeIds.join(delemiter || ',');
};

// Prepare the list of relation types.
export const getMaxDigits = (nums: number[]): number => {
  let max = 0;
  nums.forEach((element: number) => {
    let digits = element.toString().length;
    if (digits > max) {
      max = digits;
    }
  });

  return max;
};

export const getDefaultRelSep = () => {
  return '<>';
};

export const getRelationOption = (
  relationType: string,
  resource: string,
  sourceNodeType: string,
  targetNodeType: string,
) => {
  const sep = getDefaultRelSep();

  // Two formats of relationships are supported:
  // 1. Single field mode: bioarx::Covid2_acc_host_gene::Disease:Gene
  // 2. Multiple fields mode: relationshipType<>resource<>sourceNodeType<>targetNodeType
  if (relationType.indexOf('::') >= 0) {
    return relationType;
  } else {
    return [relationType, resource, sourceNodeType, targetNodeType].join(sep);
  }
};

export const makeRelationTypes = (edgeStat: RelationStat[]): OptionType[] => {
  let o: OptionType[] = [];
  const maxDigits = getMaxDigits(edgeStat.map((element: RelationStat) => element.relation_count));

  edgeStat.forEach((element: RelationStat) => {
    const relation_count = element.relation_count.toString().padStart(maxDigits, '0');
    const relationshipType = getRelationOption(
      element.relation_type,
      element.resource,
      element.start_entity_type,
      element.end_entity_type,
    );

    o.push({
      order: element.relation_count,
      label: `[${relation_count}] ${relationshipType}`,
      value: relationshipType,
      description: element.description || 'No description available.',
    });
  });

  console.log('makeRelationTypes', o, edgeStat);
  return o.sort((a: any, b: any) => a.order - b.order);
};

// **************************************************************
// Prepare the list of entities.
export function makeQueryEntityStr(params: Partial<Entity>, order?: string[]): string {
  let query: ComposeQueryItem = {} as ComposeQueryItem;

  let label_query_item = {} as QueryItem;
  if (params.label) {
    label_query_item = {
      operator: '=',
      field: 'label',
      value: params.label,
    };
  }

  let filteredKeys = filter(Object.keys(params), (key) => key !== 'label');
  if (filteredKeys.length > 1) {
    query = {
      operator: 'or',
      items: [],
    };

    if (order) {
      // Order and filter the keys.
      filteredKeys = order.filter((key) => filteredKeys.includes(key));
    }
  } else {
    query = {
      operator: 'and',
      items: [],
    };
  }

  query['items'] = filteredKeys.map((key) => {
    return {
      operator: 'ilike',
      field: key,
      value: `%${params[key as keyof Entity]}%`,
    };
  });

  if (label_query_item.field) {
    if (query['operator'] === 'and') {
      query['items'].push(label_query_item);
    } else {
      query = {
        operator: 'and',
        items: [query, label_query_item],
      };
    }
  }

  return JSON.stringify(query);
}

let timeout: ReturnType<typeof setTimeout> | null;

// This function is used to fetch the entities of the selected entity type.
// All the nodes will be added to the options as a dropdown list.
export const fetchNodes = async (
  getEntities: APIs['GetEntitiesFn'],
  entityType: string,
  value: string,
  callback: (any: any) => void,
) => {
  // We might not get good results when the value is short than 3 characters.
  if (value.length < 3) {
    callback([]);
    return;
  }

  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  // TODO: Check if the value is a valid id.

  let queryMap = {};
  let order: string[] = [];
  // If the value is a number, then maybe it is an id or xref but not for name or synonyms.
  if (value && !isNaN(Number(value))) {
    queryMap = { id: value, xrefs: value, label: entityType };
    order = ['id', 'xrefs'];
  } else {
    queryMap = { name: value, synonyms: value, xrefs: value, id: value, label: entityType };
    order = ['name', 'synonyms', 'xrefs', 'id'];
  }

  const fetchData = () => {
    getEntities({
      query_str: makeQueryEntityStr(queryMap, order),
      page: 1,
      page_size: 50,
    })
      .then((response) => {
        const { records } = response;
        const formatedData = records.map((item: any) => ({
          value: item['id'],
          text: `${item['id']} | ${item['name']}`,
        }));
        console.log('getLabels results: ', formatedData);
        // const options = formatedData.map(d => <Option key={d.value}>{d.text}</Option>);
        const options = formatedData.map((d) => {
          return { label: d.text, value: d.value };
        });
        callback(options);
      })
      .catch((error) => {
        console.log('requestNodes Error: ', error);
        callback([]);
      });
  };

  timeout = setTimeout(fetchData, 300);
};
