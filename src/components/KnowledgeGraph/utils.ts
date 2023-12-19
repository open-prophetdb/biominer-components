import type { TableColumnType } from 'antd';
import { filter, uniq } from 'lodash';
import { Graph } from '@antv/g6';
import type { NodeBadge } from './typings';
import { GraphNode, GraphEdge, COMPOSED_ENTITY_DELIMITER, Entity, Entity2D } from '../typings';
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

export const processEdges = (edges: GraphEdge[], options: any): GraphEdge[] => {
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
  if (dataItem.data) {
    return {
      ...removeComplexData(dataItem.data, blackList),
      ...removeComplexData(dataItem, blackList),
      // Save the original data in metadata for transfering to other components
      metadata: dataItem,
    };
  } else {
    return {
      ...removeComplexData(dataItem),
      // Save the original data in metadata for transfering to other components
      metadata: dataItem,
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
