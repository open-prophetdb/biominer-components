import type { TableColumnType } from 'antd';
import { filter, uniq, uniqBy } from 'lodash';
import { Graph } from '@antv/g6';
import type { NodeBadge, ExpandedGraphData } from './typings';
import {
  GraphNode,
  GraphEdge,
  COMPOSED_ENTITY_DELIMITER,
  Entity,
  Entity2D,
  GraphData,
  Layout,
  RelationStat,
} from '../typings';
import voca from 'voca';

export const getDefaultBadge = (color: string, value?: string | number): NodeBadge => {
  return {
    position: 'RT',
    type: 'text',
    value: value || '',
    size: [15, 15],
    fill: color,
    color: '#fff',
  };
};

export const formatNodeIdFromEntity = (entity: Entity) => {
  return `${entity.label}${COMPOSED_ENTITY_DELIMITER}${entity.id}`;
};

export const formatNodeIdFromEntity2D = (entity: Entity2D) => {
  return `${entity.entity_type}${COMPOSED_ENTITY_DELIMITER}${entity.entity_id}`;
};

export const formatNodeIdFromGraphNode = (node: GraphNode) => {
  return `${node.data.label}${COMPOSED_ENTITY_DELIMITER}${node.data.id}`;
};

export const getEntityType = (node: GraphNode) => {
  return node.data.label;
};

export const getEntityId = (node: GraphNode) => {
  return node.data.id;
};

export const processEdges = (edges: GraphEdge[], options: {}): GraphEdge[] => {
  const edgeMap: Map<string, GraphEdge[]> = new Map();
  edges.forEach((edge) => {
    const { source, target } = edge;
    const id = `${source}-${target}`;
    if (edgeMap.has(id)) {
      const objs = edgeMap.get(id);
      if (objs) {
        edgeMap.set(id, [...objs, edge]);
      }
    } else {
      edgeMap.set(id, [edge]);
    }
  });

  const newEdges: GraphEdge[] = [];
  edgeMap.forEach((value, key) => {
    if (value.length > 1) {
      const [firstEdge] = value;
      const { source, target, ...others } = firstEdge;
      const reltypes = value.map((edge: GraphEdge) => edge.reltype);
      newEdges.push({
        source,
        target,
        ...others,
        reltype: reltypes.join('|'),
        relid: `MultipleLabels-${source}-${target}`,
        style: {
          ...others.style,
          label: {
            value: 'MultipleLabels',
          },
        },
        data: {
          ...others.data,
          // @ts-ignore
          identity: `MultipleLabels-${source}-${target}`,
          reltypes: reltypes,
        },
      });
    } else {
      newEdges.push(value[0]);
    }
  });

  return newEdges;
};

export const makeColumns = (dataSource: Array<Record<string, any>>, blackList: Array<string>) => {
  let keys: Array<string> = [];
  dataSource.map((item) => {
    keys = keys.concat(Object.keys(item));
  });

  let columns: TableColumnType<any>[] = [];
  const uniqKeys = uniq(keys);
  const filteredUniqKeys = filter(uniqKeys, (key) => {
    return blackList.indexOf(key) < 0;
  });
  filteredUniqKeys.map((item) => {
    columns.push({
      title: voca.titleCase(item),
      key: item,
      dataIndex: item,
      align: 'center',
      ellipsis: true,
    });
  });

  return columns;
};

export const makeDataSources = (dataSource: Array<Record<string, any>>) => {
  return dataSource.map((item) => {
    return makeDataSource(item);
  });
};

export const removeComplexData = (dataItem: Record<string, any>, blackList?: Array<string>) => {
  const newObj: any = {};
  const keys = Object.keys(dataItem);
  const filteredKeys = filter(keys, (key) => {
    if (blackList) {
      return blackList.indexOf(key) < 0;
    } else {
      return true;
    }
  });
  filteredKeys.forEach((key) => {
    if (['string', 'number', 'boolean'].indexOf(typeof dataItem[key]) >= 0) {
      newObj[key] = dataItem[key];
    }
  });

  return newObj;
};

export const makeDataSource = (dataItem: Record<string, any>, blackList?: Array<string>) => {
  let metadata = blackList?.includes('metadata') ? {} : { metadata: dataItem };
  if (dataItem.data) {
    return {
      ...removeComplexData(dataItem.data, blackList),
      ...removeComplexData(dataItem, blackList),
      // Save the original data in metadata for transfering to other components
      ...metadata,
    };
  } else {
    return {
      ...removeComplexData(dataItem),
      // Save the original data in metadata for transfering to other components
      ...metadata,
    };
  }
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
  if (relationType.indexOf(COMPOSED_ENTITY_DELIMITER) >= 0) {
    return relationType;
  } else {
    return [relationType, resource, sourceNodeType, targetNodeType].join(sep);
  }
};

export const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const getSelectedNodes = (graph?: Graph) => {
  if (!graph) {
    return [];
  }

  const selectedNodes = graph.getNodes().filter((node: any) => node.hasState('selected'));
  return selectedNodes.map((node: any) => node.getModel() as GraphNode);
};

export const getNodes = (graph?: Graph) => {
  if (!graph) {
    return [];
  }

  const nodes = graph.getNodes();
  return nodes.map((node: any) => node.getModel() as GraphNode);
};

const defaultExpandedGraphData: ExpandedGraphData = {
  nodes: [],
  edges: [],
  isDirty: false,
  currentUUID: 'New Graph',
};

export const loadGraphDataFromLocalStorage = (): ExpandedGraphData => {
  let presetGraphData = localStorage.getItem('presetGraphData');
  if (presetGraphData) {
    try {
      return (JSON.parse(presetGraphData) || {}) as ExpandedGraphData;
    } catch (error) {
      console.log('Error when parsing preset graph data: ', error);
      // TODO: Do we need to clear the preset graph data?
      return defaultExpandedGraphData;
    }
  } else {
    return defaultExpandedGraphData;
  }
};

export const pushGraphDataToLocalStorage = (data: GraphData) => {
  let oldData = loadGraphDataFromLocalStorage() as ExpandedGraphData;
  let newData = {
    nodes: uniqBy([...oldData.nodes, ...data.nodes], 'id'),
    edges: uniqBy([...oldData.edges, ...data.edges], 'relid'),
  };

  saveGraphDataToLocalStorage(newData, true, oldData.currentUUID);
};

export const saveLlmResponsesToLocalStorage = (responses: any) => {
  localStorage.setItem('llmResponses', JSON.stringify(responses));
};

export const loadLlmResponsesFromLocalStorage = (): any => {
  let llmResponses = localStorage.getItem('llmResponses');
  if (llmResponses) {
    try {
      return JSON.parse(llmResponses) || {};
    } catch (error) {
      console.log('Error when parsing llm responses: ', error);
      return {};
    }
  } else {
    return {};
  }
};

export const clearLlmResponsesFromLocalStorage = () => {
  localStorage.removeItem('llmResponses');
};

export const saveGraphDataToLocalStorage = (
  data: GraphData,
  isDirty: boolean,
  currentUUID: string,
) => {
  if (!data || !data.nodes || data.nodes.length == 0) {
    return;
  }
  let graphData = {
    nodes: data.nodes,
    edges: data.edges,
    isDirty: isDirty,
    currentUUID: currentUUID,
  };
  localStorage.setItem('presetGraphData', JSON.stringify(graphData));
};

export const clearGraphDataFromLocalStorage = () => {
  localStorage.removeItem('presetGraphData');
};
