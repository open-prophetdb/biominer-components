/* eslint-disable no-undef */
import React, { ReactNode, useEffect, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Row, Col, Tag, Tabs, Table, message, Button, Spin, Empty, Tooltip, Modal } from 'antd';
import type { TableColumnType } from 'antd';
import {
  CloudDownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  SettingFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Toolbar from '../Toolbar';
import { uniqBy } from 'lodash';
import GraphinWrapper from './GraphinWrapper';
import QueryBuilder from './QueryBuilder';
import AdvancedSearch from './AdvancedSearch';
import CanvasStatisticsChart from '../CanvasStatisticsChart';
import StatisticsChart from '../StatisticsChart';
import SimilarityChart from '../SimilarityChart';
// import ReactResizeDetector from 'react-resize-detector';

import {
  makeColumns,
  makeDataSources,
  defaultLayout,
  isUUID,
  getNodes,
  getSelectedNodes,
  processEdges,
  formatNodeIdFromEntity2D,
  formatNodeIdFromGraphNode,
} from './utils';
import NodeInfoPanel from '../NodeInfoPanel';
import EdgeInfoPanel from '../EdgeInfoPanel';
import GraphStoreTable from '../GraphStoreTable';
import GraphStoreForm from '../GraphStoreForm';
import type { Graph } from '@antv/graphin';
import type {
  GraphHistoryItem,
  GraphData,
  GraphEdge,
  EntityStat,
  RelationStat,
  GraphNode,
  SearchObjectInterface,
  Entity2D,
  MergeMode,
} from '../typings';
import { EdgeInfo, MenuItem, CanvasMenuItem } from './typings';
import Movable from '../Movable';
// @ts-ignore
import GraphBackground from './graph-background.png';
import { KnowledgeGraphProps } from './index.t';
import type { StatisticsData } from '../StatisticsDataArea/index.t';
import { stat_total_node_count, stat_total_relation_count } from '../StatisticsChart/utils';

import './index.less';
import { LinkedNodesSearchObjectClass } from '../LinkedNodesSearcher/index.t';
import { SimilarityNodesSearchObjectClass } from '../SimilarityNodesSearcher/index.t';

const style = {
  // @ts-ignore
  backgroundImage: `url(${GraphBackground})`,
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = (props) => {
  const [modal, contextHolder] = Modal.useModal();
  const [data, setData] = useState<GraphData>(
    props.data || {
      nodes: [],
      edges: [],
    },
  );

  const [nodeStat, setNodeStat] = useState<EntityStat[]>([]);
  const [edgeStat, setEdgeStat] = useState<RelationStat[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData>({} as StatisticsData);
  const [nodeColorMap, setNodeColorMap] = useState<Record<string, string>>({});

  const [nodeColumns, setNodeColumns] = useState<TableColumnType<any>[]>([]);
  const [nodeDataSources, setNodeDataSources] = useState<Array<Record<string, any>>>([]);
  const [edgeColumns, setEdgeColumns] = useState<TableColumnType<any>[]>([]);
  const [edgeDataSources, setEdgeDataSources] = useState<Array<Record<string, any>>>([]);

  const [toolbarVisible, setToolbarVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [nodeInfoPanelVisible, setNodeInfoPanelVisible] = useState<boolean>(false);

  const [clickedNode, setClickedNode] = useState<GraphNode | undefined>(undefined);
  const [edgeInfoPanelVisible, setEdgeInfoPanelVisible] = useState<boolean>(false);
  const [clickedEdge, setClickedEdge] = useState<EdgeInfo | undefined>(undefined);

  const [similarityChartVisible, setSimilarityChartVisible] = useState<boolean>(false);
  const [similarityArray, setSimilarityArray] = useState<Entity2D[]>([]);
  const [hightlightMode, setHightlightMode] = useState<'activate' | 'focus'>('activate');

  const [currentNode, setCurrentNode] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string>>([]);
  const [advancedSearchPanelActive, setAdvancedSearchPanelActive] = useState<boolean>(false);
  const [searchObject, setSearchObject] = useState<SearchObjectInterface>();

  // You must have a oldLayout to make the layout work before user select a layout from the menu
  const [layout, setLayout] = React.useState<any>(defaultLayout);

  // Graph store
  // Why we need a parentGraphUUID and a currentGraphUUID? Because the platform don't support multiple branches for each history chain. So we always use the latest graph as the parent graph, and the current graph is the graph that user is editing.
  const [parentGraphUUID, setParentGraphUUID] = useState<string>('New Graph');
  const [currentGraphUUID, setCurrentGraphUUID] = useState<string>('New Graph');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [graphHistory, setGraphHistory] = useState<GraphHistoryItem[]>([]);
  const [graphTableVisible, setGraphTableVisible] = useState<boolean>(false);
  const [graphFormVisible, setGraphFormVisible] = useState<boolean>(false);
  const [graphFormPayload, setGraphFormPayload] = useState<Record<string, any>>({});

  const checkAndSetData = (data: GraphData) => {
    const nodeIds = new Set(data.nodes.map((node) => node.id));
    const edges = data.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

    setIsDirty(true);
    setData({
      nodes: data.nodes,
      edges: processEdges(edges, {}),
    });
  };

  const onClearGraph = () => {
    setData({
      nodes: [],
      edges: [],
    });
    setParentGraphUUID('');
    setCurrentGraphUUID('');
  };

  useEffect(() => {
    const nodes = makeDataSources(data.nodes);
    setNodeDataSources(nodes);

    const nodeColumns = makeColumns(nodes, ['comboId', 'style', 'data']);
    setNodeColumns(nodeColumns);

    const edges = makeDataSources(data.edges);
    setEdgeDataSources(edges);

    const edgeColumns = makeColumns(edges, []);
    setEdgeColumns(edgeColumns);
    console.log('Node & Edge Columns: ', nodeColumns, edgeColumns);

    setStatistics({
      numNodes: data.nodes.length,
      numEdges: data.edges.length,
      numAllNodes: stat_total_node_count(nodeStat),
      numAllEdges: stat_total_relation_count(edgeStat),
      isDirty: isDirty,
      currentParentUUID: currentGraphUUID,
    });
  }, [data, edgeStat, nodeStat, currentGraphUUID]);

  const loadGraphs = () => {
    props.apis
      .GetGraphHistoryFn({ page: 1, page_size: 100 })
      .then((response) => {
        setGraphHistory(response.records);
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to get graph histories, please check the network connection.');
      });
  };

  const getDimensions = (nodeIds: string[], nodeTypes: string[]): Promise<Entity2D[]> => {
    const makeAndQuery = (entityId: string, entityType: string) => {
      return {
        operator: 'and',
        items: [
          {
            operator: '=',
            field: 'entity_id',
            value: entityId,
          },
          {
            operator: '=',
            field: 'entity_type',
            value: entityType,
          },
        ],
      };
    };

    let query = {
      operator: 'or',
      items: nodeIds.map((nodeId, index) => makeAndQuery(nodeId, nodeTypes[index])),
    };

    return new Promise((resolve, reject) => {
      props.apis
        .GetEntity2DFn({
          query_str: JSON.stringify(query),
          page: 1,
          page_size: nodeIds.length,
        })
        .then((res) => {
          console.log('Get dimensions: ', res);
          const records = res.records.map((record) => {
            return {
              ...record,
              color: nodeColorMap[record.entity_type],
            };
          });
          resolve(records);
        })
        .catch((err) => {
          console.log('Error when getting dimensions: ', err);
          reject([]);
        });
    });
  };

  const loadGraph = (graphHistoryItem: GraphHistoryItem, latestChild: GraphHistoryItem) => {
    const payload = JSON.parse(graphHistoryItem.payload);
    if (payload) {
      setIsDirty(false);
      // Only support one level of graph hierarchy, so the parent graph is always the latest child graph.
      setParentGraphUUID(latestChild.id);
      setCurrentGraphUUID(graphHistoryItem.id);
      checkAndSetData(payload.data);
      setLayout(payload.layout);
      setToolbarVisible(payload.toolbarVisible);
      setGraphTableVisible(false);
    }
  };

  const onLoadGraph = (graphHistoryItem: GraphHistoryItem, latestChild: GraphHistoryItem) => {
    console.log('Load graph: ', graphHistoryItem, latestChild);
    if (isDirty) {
      modal.confirm({
        title: 'You have unsaved changes',
        icon: <ExclamationCircleOutlined />,
        content: 'Are you sure to load another graph?',
        okText: 'Load',
        cancelText: 'Cancel',
        onOk() {
          setIsDirty(false);
          loadGraph(graphHistoryItem, latestChild);
        },
        onCancel() {
          // TODO: anything else?
        },
      });
    } else {
      loadGraph(graphHistoryItem, latestChild);
    }
  };

  const onDeleteGraph = (graphHistoryItem: GraphHistoryItem) => {
    // TODO: add confirm dialog, it will delete the graph cascade.
    props.apis
      .DeleteGraphHistoryFn({ id: graphHistoryItem.id })
      .then((response) => {
        message.success('Graph deleted successfully.');
        loadGraphs();
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to delete graph, please check the network connection.');
      });
  };

  const loadNodeColorMap = () => {
    props.apis
      .GetEntityColorMapFn()
      .then((response) => {
        console.log('Entity Color Map: ', response);
        setNodeColorMap(response);
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to get entity color map, please check the network connection.');
      });
  };

  useEffect(() => {
    props.apis
      .GetStatisticsFn()
      .then((response) => {
        setNodeStat(response.entity_stat);
        setEdgeStat(response.relation_stat);
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to get statistics, please check the network connection.');
      });

    loadGraphs();
    loadNodeColorMap();
  }, []);

  useEffect(() => {
    // You need to check if the data is empty, otherwise it will update on an unmounted component.
    if (advancedSearchPanelActive === false && searchObject) {
      setLoading(true);
      message.info('Loading data, please wait...');
      searchObject
        .process(props.apis)
        .then((response) => {
          console.log('Query Graph Response: ', response);
          if (searchObject.merge_mode == 'replace') {
            checkAndSetData(response);
          } else if (searchObject.merge_mode == 'append') {
            checkAndSetData({
              nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
              edges: uniqBy([...data.edges, ...response.edges], 'relid'),
            });
          } else if (searchObject.merge_mode == 'subtract') {
            const { nodes, edges } = response;
            let nodesToRemove: string[] = nodes.map((node) => node.id);

            nodesToRemove = nodesToRemove.filter((node) => {
              // Remove nodes that have only one relationship and is in the nodesToRemove list
              const prediction = (rel: GraphEdge, node: string, reltypes: string[]) => {
                return (
                  (rel.target == node || rel.source == node) && reltypes.indexOf(rel.reltype) > -1
                );
              };

              // Get all relationships that meet the criteria, maybe it comes from user's input or query result
              const relation_types =
                searchObject.data.relation_types || edges.map((edge) => edge.reltype);
              const found = data.edges.filter((rel) => prediction(rel, node, relation_types));

              console.log('Found: ', found, node, relation_types);
              return found.length < 2;
            });

            // Remove nodes and relationships that meet the removal criteria
            const newNodes = data.nodes.filter((node) => !nodesToRemove.includes(node.id));
            const newRelationships = data.edges.filter(
              (rel) => !nodesToRemove.includes(rel.source) && !nodesToRemove.includes(rel.target),
            );

            const newData = {
              nodes: newNodes,
              edges: newRelationships,
            };

            console.log('New Data: ', newData, data, response, nodesToRemove);
            checkAndSetData(newData);
          } else {
            message.warning('Unknown merge mode, please retry later.');
          }
          message.success(
            `Find ${response.nodes.length} entities and ${response.edges.length} relationships.`,
          );
          setLoading(false);
        })
        .catch((error) => {
          console.log('getNodes Error: ', error);
          message.warning('Unknown errors or Cannot find any entities & relationships.');
          setLoading(false);
        });
    } else {
      console.log(
        'Advanced Search Panel is active or search object is invalid: ',
        advancedSearchPanelActive,
        searchObject,
      );
    }
  }, [searchObject]);

  const enableAdvancedSearch = () => {
    setAdvancedSearchPanelActive(true);
  };

  const disableAdvancedSearch = () => {
    setAdvancedSearchPanelActive(false);
  };

  const updateSearchObject = (searchObject: SearchObjectInterface) => {
    console.log('Search Object: ', searchObject);
    disableAdvancedSearch();
    setSearchObject(searchObject);
  };

  const searchLinkedNodes = (
    entityType: string,
    entityId: string | undefined,
    mergeMode?: MergeMode,
    nsteps?: number,
    limit?: number,
  ) => {
    if (entityId) {
      let linkedNodesSearchObject = new LinkedNodesSearchObjectClass(
        {
          entity_type: entityType,
          entity_id: entityId,
          nsteps: nsteps || 1,
          limit: limit || 10,
        },
        mergeMode || 'append',
      );

      setSearchObject(linkedNodesSearchObject);
    }
  };

  const searchSimilarNodes = (
    entityType: string,
    entityId: string | undefined,
    mergeMode?: MergeMode,
    topk?: number,
  ) => {
    if (entityId) {
      let similarNodesSearchObject = new SimilarityNodesSearchObjectClass(
        {
          entity_type: entityType,
          entity_id: entityId,
          topk: topk || 10,
        },
        mergeMode || 'append',
      );

      setSearchObject(similarNodesSearchObject);
    }
  };

  const onCanvasMenuClick = (menuItem: CanvasMenuItem, graph: any, apis: any) => {
    if (menuItem.key == 'auto-connect') {
      message.info('Auto connecting nodes, please wait...');
      setLoading(true);
      const nodes = graph.getNodes().map((node: any) => node.getModel() as GraphNode);
      const nodeIds = nodes.map((node: GraphNode) => formatNodeIdFromGraphNode(node));
      props.apis
        .GetConnectedNodesFn({
          node_ids: nodeIds.join(','),
        })
        .then((response: GraphData) => {
          console.log('Auto Connect Response: ', response);
          checkAndSetData({
            nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
            edges: uniqBy([...data.edges, ...response.edges], 'relid'),
          });

          if (response.nodes.length == 0 && response.edges.length == 0) {
            message.warning('No more relationships can be found.');
          } else {
            message.success(
              `Find ${response.nodes.length} entities and ${response.edges.length} relationships.`,
            );
          }
        })
        .catch((error: any) => {
          console.log('Auto Connect Error: ', error);
          message.warning('Something went wrong, please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const onEdgeMenuClick = (
    menuItem: MenuItem,
    source: GraphNode,
    target: GraphNode,
    edge: GraphEdge,
    graph: Graph,
    graphin: any,
  ) => {
    if (menuItem.key == 'what-is-the-relationship') {
      if (props.postMessage) {
        props.postMessage(
          `what is the relationship between ${source.data.name} and ${target.data.name}?`,
        );
      }
    } else if (menuItem.key == 'show-edge-details') {
      setEdgeInfoPanelVisible(true);
      setClickedEdge({
        startNode: source,
        endNode: target,
        edge: edge,
      });
      // TODO: Get edge details and show in the info panel
    }
  };

  const onNodeMenuClick = (menuItem: MenuItem, node: GraphNode, graph: Graph, graphin: any) => {
    console.log(`onNodeMenuClick [${menuItem.key}]: `, menuItem, node);
    if (menuItem.key == 'delete-nodes') {
      const nodes = getSelectedNodes(graph);
      const ids = [...nodes.map((node) => node.id)];
      if (nodes.length == 0) {
        message.info('Please select one or more nodes to delete.');
        return;
      } else {
        message.info(`Deleting ${nodes.length} nodes, please wait...`);
        nodes.forEach((node) => {
          graph.removeItem(node.id);
        });
        checkAndSetData({
          nodes: data.nodes.filter((node) => !ids.includes(node.id)),
          edges: data.edges.filter(
            (edge) => !ids.includes(edge.source) && !ids.includes(edge.target),
          ),
        });
      }
    } else if (menuItem.key == 'expand-one-step') {
      enableAdvancedSearch();
      searchLinkedNodes(node.data.label, node.data.id, 'append', 1, 10);
    } else if (menuItem.key == 'find-similar-nodes') {
      enableAdvancedSearch();
      searchSimilarNodes(node.data.label, node.data.id, 'append', 10);
    } else if (
      ['expand-all-paths-1', 'expand-all-paths-2', 'expand-all-paths-3'].includes(menuItem.key)
    ) {
      // TODO: How to connect two nodes within n steps?
      // console.log('Expand All Paths: ', menuItem.key);
      // const selectedNodes = getSelectedNodes(graph);
      // if (selectedNodes.length == 0) {
      //   message.info('Please select one or more nodes to expand.');
      //   return;
      // } else {
      //   setSearchObject({
      //     nodes: selectedNodes,
      //     merge_mode: 'append',
      //     mode: 'path',
      //     nsteps: parseInt(menuItem.key.split('-').pop() || '1'),
      //     limit: 50,
      //   });
      // }
    } else if (menuItem.key == 'expand-selected-nodes') {
      // TODO: Do we need to expand all selected nodes?
      // const nodes = getSelectedNodes(graph);
      // // If no nodes are selected, use the right clicked node
      // if (nodes.length == 0 && node) {
      //   nodes.push(node);
      // }
      // enableAdvancedSearch();
      // setSearchObject({
      //   nodes: nodes,
      //   merge_mode: 'append',
      //   mode: 'batchNodes',
      //   node_id: '',
      //   node_type: '',
      // });
    } else if (menuItem.key == 'what-is-the-node') {
      if (props.postMessage) {
        props.postMessage(`what is the ${node.data.name}?`);
      }
    } else if (menuItem.key == 'predict-relationships') {
      // TODO: How to predict relationship between two nodes?
      // const sourceId = `${node.data.label}::${node.data.id}`;
      // const selectedNodes = getSelectedNodes(graph);
      // let targetIds = selectedNodes.map((node) => `${node.data.label}::${node.data.id}`);
      // targetIds = targetIds.filter((id) => id != sourceId);
      // console.log('Predict Relationships: ', menuItem, sourceId, targetIds, selectedNodes);
      // predictRelationships(sourceId, targetIds)
      //   .then((response: GraphData) => {
      //     console.log('Predict Relationships Response: ', response);
      //     if (response.nodes.length == 0 && response.edges.length == 0) {
      //       message.warning('No more relationships can be found.');
      //     } else {
      //       checkAndSetData({
      //         nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
      //         edges: uniqBy([...data.edges, ...response.edges], 'relid'),
      //       });
      //     }
      //   })
      //   .catch((error: any) => {
      //     console.log('Predict Relationships Error: ', error);
      //     message.warning('Something went wrong, please try again later.');
      //   });
    } else if (menuItem.key == 'visulize-similarities') {
      const nodes = getNodes(graph);
      const nodeIds = nodes.map((node) => node.data.id);
      const nodeTypes = nodes.map((node) => node.data.label);
      setLoading(true);
      getDimensions(nodeIds, nodeTypes)
        .then((response: Entity2D[]) => {
          console.log('Get Dimensions Response: ', response, nodeIds, nodeTypes);
          setSimilarityArray(response);
          setSimilarityChartVisible(true);
          setLoading(false);
        })
        .catch((error: any) => {
          console.log('Get Dimensions Error: ', error);
          setSimilarityArray([]);
          setSimilarityChartVisible(false);
          message.error('Failed to get similarities, please check the network connection.');
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (menuItem.key == 'show-node-details') {
      setNodeInfoPanelVisible(true);
      setClickedNode(node);
      // TODO: Get node details and show in the info panel
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
  };

  const TableTabs = (props: any) => {
    const counts = React.Children.count(props.children);
    const childrenArray = React.Children.toArray(props.children);
    const items = [
      { label: 'Nodes', key: 'nodes', children: counts >= 2 ? childrenArray[0] : 'No Content' },
      { label: 'Edges', key: 'edges', children: counts >= 2 ? childrenArray[1] : 'No Content' },
    ];
    return (
      <Tabs className="tabs-nav-center">
        {items.map((item) => {
          return (
            <Tabs.TabPane tab={item.label} key={item.key}>
              {item.children}
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    );
  };

  const saveGraphData = () => {
    setGraphFormVisible(true);
    // TODO: Can we save the position of all nodes and edges and more configurations?
    setGraphFormPayload({
      data: data,
      layout: layout,
      toolbarVisible: toolbarVisible,
    });
  };

  const onChangeToolbarVisible = () => {
    setToolbarVisible(!toolbarVisible);
  };

  const onClickNode = (nodeId: string, node: GraphNode): void => {
    // TODO: Get node details and pass to InfoPanel
    console.log('Node Clicked: ', nodeId, data, node);
    if (node) {
      setNodeInfoPanelVisible(true);
      setClickedNode(node);
    }
  };

  const onClickEdge = (
    edgeId: string,
    startNode: GraphNode,
    endNode: GraphNode,
    edge: GraphEdge,
  ): void => {
    console.log('Edge Clicked: ', edgeId);
    if (edgeId) {
      setEdgeInfoPanelVisible(true);
      setClickedEdge({
        edge: edge,
        startNode: startNode,
        endNode: endNode,
      });
    }
  };

  const onCloseInfoPanel = () => {
    setEdgeInfoPanelVisible(false);
    setNodeInfoPanelVisible(false);
  };

  // const onWidthChange = (width?: number, height?: number) => {
  //   // message.info(`Graph width changed to ${width}`)
  //   // TODO: Fix this hacky way to refresh graph
  //   if (width) {
  //     setGraphRefreshKey(width)
  //   } else if (height) {
  //     setGraphRefreshKey(height)
  //   }
  // }

  const enterFullScreenHandler = useFullScreenHandle();

  const onSubmitGraph = (data: GraphHistoryItem) => {
    return new Promise((resolve, reject) => {
      if (parentGraphUUID && isUUID(parentGraphUUID)) {
        data = { ...data, parent: parentGraphUUID };
      }

      // TODO: Remove the id field, because it will cause the backend to throw an error.
      // @ts-ignore
      delete data.id;

      props.apis
        .PostGraphHistoryFn(data)
        .then((response) => {
          message.success('Graph data saved.');
          loadGraphs();
          return resolve(response);
        })
        .catch((error) => {
          console.log('Post Graphs Error: ', error);
          message.error('Graph save failed.');
          return reject(error);
        });
    });
  };

  return (
    <FullScreen handle={enterFullScreenHandler}>
      <Row className="knowledge-graph-container" id="knowledge-graph-container">
        <Spin spinning={loading}>
          <Row className="left-toolbar">
            <Tooltip
              title={enterFullScreenHandler.active ? 'Exit Full Screen' : 'Enter Full Screen'}
              placement="right"
            >
              <Button
                className="full-screen-button"
                onClick={
                  enterFullScreenHandler.active
                    ? enterFullScreenHandler.exit
                    : enterFullScreenHandler.enter
                }
                shape="circle"
                icon={
                  enterFullScreenHandler.active ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
              />
            </Tooltip>
            <Tooltip title={toolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'} placement="right">
              <Button
                className="toolbar-button"
                onClick={onChangeToolbarVisible}
                shape="circle"
                icon={toolbarVisible ? <SettingOutlined /> : <SettingFilled />}
              />
            </Tooltip>
            <Tooltip title="Save Graph Data" placement="right">
              <Button
                className="save-button"
                onClick={saveGraphData}
                shape="circle"
                icon={<CloudUploadOutlined />}
              />
            </Tooltip>
            <Tooltip title="Load Graph Data" placement="right">
              <Button
                className="clear-button"
                onClick={() => {
                  setGraphTableVisible(true);
                }}
                shape="circle"
                icon={<CloudDownloadOutlined />}
              />
            </Tooltip>
          </Row>
          <Row className="top-toolbar">
            <QueryBuilder
              onChange={searchLinkedNodes}
              onAdvancedSearch={enableAdvancedSearch}
              entityTypes={nodeStat.map((stat) => stat.entity_type)}
              getEntities={props.apis.GetEntitiesFn}
            ></QueryBuilder>
            <AdvancedSearch
              onOk={updateSearchObject}
              visible={advancedSearchPanelActive}
              onCancel={disableAdvancedSearch}
              entityTypes={nodeStat.map((stat) => stat.entity_type)}
              searchObject={searchObject}
              relationStat={edgeStat}
              key={searchObject?.get_current_node_id() || 'default'}
              parent={document.getElementById('knowledge-graph-container') as HTMLElement}
              apis={props.apis}
            ></AdvancedSearch>
          </Row>
          <Col className="graphin" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Toolbar position="top" width="300px" height="100%" closable={true} title="Statistics">
              <StatisticsChart nodeStat={nodeStat} edgeStat={edgeStat}></StatisticsChart>
            </Toolbar>
            <Toolbar position="left" width={'60%'} title="Charts" closable={true}>
              <CanvasStatisticsChart data={data}></CanvasStatisticsChart>
            </Toolbar>
            <Toolbar
              position="right"
              width={'80%'}
              closable={false}
              maskVisible
              visible={nodeInfoPanelVisible}
              onClose={onCloseInfoPanel}
            >
              {clickedNode && props.getGeneInfo && props.getItems4GenePanel ? (
                <NodeInfoPanel
                  node={clickedNode}
                  getGeneInfo={props.getGeneInfo}
                  getItems4GenePanel={props.getItems4GenePanel}
                ></NodeInfoPanel>
              ) : (
                <Empty description="No node selected" />
              )}
            </Toolbar>
            <Toolbar
              position="right"
              width={'80%'}
              closable={false}
              maskVisible
              visible={edgeInfoPanelVisible}
              onClose={onCloseInfoPanel}
            >
              {clickedEdge ? (
                <EdgeInfoPanel edgeInfo={clickedEdge}></EdgeInfoPanel>
              ) : (
                <Empty description="No edge selected" />
              )}
            </Toolbar>
            <Toolbar
              position="bottom"
              width="300px"
              height="300px"
              onClick={() => {
                setCurrentNode('');
              }}
            >
              <TableTabs>
                {nodeColumns.length > 0 ? (
                  <Table
                    size={'small'}
                    scroll={{ y: 200 }}
                    rowKey={'identity'}
                    dataSource={nodeDataSources}
                    columns={nodeColumns}
                    pagination={false}
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: (event) => {
                          console.log('Click the node item: ', event, record);
                          setCurrentNode(record.identity);
                          setSelectedRowKeys([record.identity]);
                        },
                      };
                    }}
                    rowSelection={{
                      type: 'radio',
                      ...rowSelection,
                    }}
                  />
                ) : null}
                {nodeColumns.length > 0 ? (
                  <Table
                    size={'small'}
                    scroll={{ y: 200 }}
                    rowKey={'id'}
                    dataSource={edgeDataSources}
                    columns={edgeColumns}
                    pagination={false}
                  />
                ) : null}
              </TableTabs>
            </Toolbar>
            <GraphinWrapper
              selectedNode={currentNode}
              highlightMode={hightlightMode}
              data={data}
              layout={layout}
              style={style}
              queriedId={searchObject?.get_current_node_id() || ''}
              statistics={statistics}
              toolbarVisible={toolbarVisible}
              onClearGraph={onClearGraph}
              onEdgeMenuClick={onEdgeMenuClick}
              chatbotVisible={props.postMessage ? true : false}
              onClickNode={onClickNode}
              onClickEdge={onClickEdge}
              onCanvasMenuClick={onCanvasMenuClick}
              changeLayout={(layout) => {
                setLayout(layout);
              }}
              onNodeMenuClick={onNodeMenuClick}
            >
              {similarityChartVisible ? (
                <Movable
                  onClose={() => {
                    setSimilarityChartVisible(false);
                    setHightlightMode('activate');
                  }}
                  width="600px"
                  title="Node Similarity [t-SNE]"
                >
                  <SimilarityChart
                    data={similarityArray}
                    method="tsne"
                    description='If you expect to highlight nodes on the chart, you need to enable the "Focus" and "Select" mode.'
                    onClick={(entity2D: Entity2D) => {
                      setCurrentNode(formatNodeIdFromEntity2D(entity2D));
                      setHightlightMode('activate');
                      // TODO: Which one is better?
                      // setHightlightMode('focus');
                    }}
                  ></SimilarityChart>
                </Movable>
              ) : null}
              <GraphStoreTable
                visible={graphTableVisible}
                graphs={graphHistory}
                onLoad={onLoadGraph}
                onDelete={onDeleteGraph}
                treeFormat
                parent={document.getElementById('knowledge-graph-container') as HTMLElement}
                onClose={() => {
                  setGraphTableVisible(false);
                }}
                onUpload={(graphHistory: GraphHistoryItem) => {
                  onSubmitGraph(graphHistory);
                }}
                selectedGraphId={currentGraphUUID}
              ></GraphStoreTable>
              <GraphStoreForm
                visible={graphFormVisible}
                payload={graphFormPayload}
                parent={document.getElementById('knowledge-graph-container') as HTMLElement}
                onClose={() => {
                  setGraphFormVisible(false);
                }}
                onSubmit={(data: GraphHistoryItem) => {
                  onSubmitGraph(data).finally(() => {
                    setGraphFormVisible(false);
                  });
                }}
              ></GraphStoreForm>
            </GraphinWrapper>
            {contextHolder}
          </Col>
        </Spin>
      </Row>
    </FullScreen>
  );
};

export default KnowledgeGraph;
