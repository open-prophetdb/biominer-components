import React, { useEffect, useState, useContext } from 'react';
import Graphin, {
  Components,
  Behaviors,
  GraphinContext,
  IG6GraphEvent,
  GraphinData,
} from '@antv/graphin';
import { CustomGraphinContext } from '../Context/CustomGraphinContext';
import { INode, NodeConfig, IEdge, Graph } from '@antv/g6';
import { ContextMenu, FishEye, Toolbar } from '@antv/graphin-components';
import LayoutSelector from './Components/LayoutSelector';
import type { Layout, GraphData } from '../typings';
import LayoutNetwork from './Components/LayoutNetworks';
import {
  BoxPlotOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  DotChartOutlined,
  DeleteFilled,
  ExpandAltOutlined,
  QuestionCircleOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BranchesOutlined,
  AimOutlined,
  InfoCircleFilled,
  ForkOutlined,
  FullscreenOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  RedditOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  CloudServerOutlined,
  TagFilled,
  UndoOutlined,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { TooltipValue, LegendChildrenProps, LegendOptionType } from '@antv/graphin';
import StatisticsDataArea from '../StatisticsDataArea';
import Moveable from '../Moveable';
import { message, Descriptions, Switch, Button, Select, Empty, Menu as AntdMenu, Row } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import { makeDataSource, getDefaultBadge } from './utils';
import { prepareGraphData } from '../utils';
import type {
  OnNodeMenuClickFn,
  OnEdgeMenuClickFn,
  OnClickEdgeFn,
  OnClickNodeFn,
  OnCanvasMenuClickFn,
  AdjacencyList,
  MenuItem,
  CanvasMenuItem,
  NodeBadge,
} from './typings';
import type { GraphNode, GraphEdge } from '../typings';
import ShowPaths from './Components/ShowPaths';
import UndoRedo from './Components/UndoRedo';
import { popCurrectData } from './Components/UndoRedo';
import voca from 'voca';

import './GraphinWrapper.less';

const { MiniMap, SnapLine, Tooltip, Legend } = Components;

const {
  ZoomCanvas,
  ActivateRelations,
  ClickSelect,
  Hoverable,
  FitView,
  DragNodeWithForce,
  DragNode,
  LassoSelect,
  BrushSelect,
} = Behaviors;

const { Menu } = ContextMenu;

const snapLineOptions = {
  line: {
    stroke: 'lightgreen',
    lineWidth: 1,
  },
};

const showRelatedEdges = (node: GraphNode, graph: Graph, hideOthers?: boolean) => {
  // TODO: How to push all edges which are changed to the stack?
  // Show the edges connected with the selected nodes.
  const edges = graph.getEdges();
  edges.forEach((edge) => {
    const model = edge.getModel() as GraphEdge;
    if (model.source == node.id || model.target == node.id) {
      graph.showItem(edge, false);
    } else {
      if (hideOthers) {
        graph.hideItem(edge, false);
      }
    }
  });
};

const hideRelatedEdges = (node: GraphNode, graph: Graph, showOthers?: boolean) => {
  // TODO: How to push all edges which are changed to the stack?
  // Hide the edges connected with the selected nodes.
  const edges = graph.getEdges();
  edges.forEach((edge) => {
    const model = edge.getModel() as GraphEdge;
    console.log('Hide Edge: ', node.id, model.source, model.target);
    if (model.source == node.id || model.target == node.id) {
      graph.hideItem(edge, false);
    } else {
      if (showOthers) {
        graph.showItem(edge, false);
      }
    }
  });
};

const hideSelectedNodes = (selectedNodeKeys: string[], graph: Graph, showOthers?: boolean) => {
  // TODO: How to push all nodes which are changed to the stack?
  if (selectedNodeKeys.length == 0) {
    return;
  }

  const nodes = graph.getNodes();
  nodes.forEach((gnode) => {
    const node = gnode.getModel() as GraphNode;
    if (selectedNodeKeys.includes(node.id)) {
      graph.hideItem(gnode, false);
      hideRelatedEdges(node, graph);
    } else {
      if (showOthers) {
        graph.showItem(gnode, false);
      }
    }
  });
};

const showSelectedNodes = (selectedNodeKeys: string[], graph: Graph, hideOthers?: boolean) => {
  // TODO: How to push all nodes which are changed to the stack?
  if (selectedNodeKeys.length == 0) {
    return;
  }

  const nodes = graph.getNodes();
  console.log('Show Selected Nodes: ', selectedNodeKeys, nodes);
  nodes.forEach((gnode) => {
    const node = gnode.getModel() as GraphNode;
    if (selectedNodeKeys.includes(node.id)) {
      console.log('Show Node: ', node.id);
      graph.showItem(gnode, false);
      showRelatedEdges(node, graph);
    } else {
      if (hideOthers) {
        graph.hideItem(gnode, false);
      }
    }
  });
};

const showAllNodes = (graph: Graph) => {
  const nodes = graph.getNodes();
  nodes.forEach((gnode) => {
    graph.showItem(gnode, false);
  });
};

const showAllEdges = (graph: Graph) => {
  const edges = graph.getEdges();
  edges.forEach((edge) => {
    graph.showItem(edge, false);
  });
};

const hideSelectedEdges = (selectedEdgeKeys: string[], graph: Graph, showOthers?: boolean) => {
  // TODO: How to push all edges which are changed to the stack?
  if (selectedEdgeKeys.length == 0) {
    return;
  }

  const edges = graph.getEdges();
  edges.forEach((gedge) => {
    const edge = gedge.getModel() as GraphEdge;
    if (selectedEdgeKeys.includes(edge.relid)) {
      graph.hideItem(gedge, false);
    } else {
      if (showOthers) {
        graph.showItem(gedge, false);
      }
    }
  });
};

const showSelectedEdges = (selectedEdgeKeys: string[], graph: Graph, hideOthers?: boolean) => {
  // TODO: How to push all edges which are changed to the stack?
  if (selectedEdgeKeys.length == 0) {
    return;
  }

  const edges = graph.getEdges();
  edges.forEach((gedge) => {
    const edge = gedge.getModel() as GraphEdge;
    if (selectedEdgeKeys.includes(edge.relid)) {
      graph.showItem(gedge, false);
    } else {
      if (hideOthers) {
        graph.hideItem(gedge, false);
      }
    }
  });
};

type EdgeMenuProps = {
  onChange?: OnEdgeMenuClickFn;
  chatbotVisible?: boolean;
  onExplainRelationship?: OnEdgeMenuClickFn;
  item?: IG6GraphEvent['item'];
};

const EdgeMenu = (props: EdgeMenuProps) => {
  const { graph, apis } = useContext(GraphinContext);
  const { item, chatbotVisible, onExplainRelationship } = props;

  const [visible, setVisible] = useState<boolean>(false);
  const [sourceNode, setSourceNode] = useState<GraphNode | undefined>(undefined);
  const [targetNode, setTargetNode] = useState<GraphNode | undefined>(undefined);
  const [edge, setEdge] = useState<GraphEdge | undefined>(undefined);

  useEffect(() => {
    if (item) {
      const edge = item.getModel() as GraphEdge;
      const source = graph.findById(edge.source).getModel() as GraphNode;
      const target = graph.findById(edge.target).getModel() as GraphNode;

      if (source && target && edge) {
        setSourceNode(source);
        setTargetNode(target);
        setEdge(edge);
        setVisible(true);
      }
    } else {
      setVisible(false);
      setSourceNode(undefined);
      setTargetNode(undefined);
      setEdge(undefined);
    }
  }, []);

  const options: MenuItem[] = [
    {
      key: 'show-edge-details',
      icon: <InfoCircleFilled />,
      label: 'Show Edge Details',
    },
    {
      key: 'explain-relationship',
      icon: <RedditOutlined />,
      hidden: true,
      label: 'Explain Relationship (Experimental)',
    },
    {
      key: 'analyze-with-clinical-data',
      icon: <BarChartOutlined />,
      hidden: true,
      label: 'Analyze with Clinical Data',
      children: [
        {
          key: 'barchart',
          icon: <BarChartOutlined />,
          label: 'Bar Chart',
        },
        {
          key: 'boxchart',
          icon: <BoxPlotOutlined />,
          label: 'Box Plot',
        },
        {
          key: 'heatmap',
          icon: <HeatMapOutlined />,
          label: 'Heatmap',
        },
        {
          key: 'scatterchart',
          icon: <DotChartOutlined />,
          label: 'Scatter Chart',
        },
      ],
    },
    {
      key: 'analyze-with-omics-data',
      icon: <AimOutlined />,
      hidden: true,
      label: 'Analyze with Omics Data',
      children: [
        {
          key: 'heatmap-omics',
          icon: <HeatMapOutlined />,
          label: 'Heatmap',
        },
        {
          key: 'scatterchart-omics',
          icon: <DotChartOutlined />,
          label: 'Scatter Chart',
        },
      ],
    },
  ];

  if (chatbotVisible) {
    options.push({
      key: 'ask-question',
      icon: <QuestionCircleOutlined />,
      label: 'Ask Chatbot',
      hidden: false,
      children: [
        {
          key: 'what-is-the-relationship',
          icon: <BranchesOutlined />,
          label: `What is the relationship between the two nodes?`,
        },
      ],
    });
  }

  const onChange = function (menuKey: string) {
    const childOptions = options
      .filter((item) => {
        return item.children;
      })
      .map((item) => {
        return item.children;
      })
      .flat();

    const allOptions = options.filter((item) => {
      return !item.children;
    });

    const menuItem =
      allOptions.find((item) => {
        return item.key === menuKey;
      }) ||
      childOptions.find((item) => {
        if (item) {
          return item.key === menuKey;
        } else {
          return false;
        }
      });

    console.log('EdgeMenu: ', menuKey, menuItem);

    if (menuItem) {
      if (menuItem.handler) {
        menuItem.handler(edge);
      } else if (props.onChange && sourceNode && targetNode && edge && graph && apis) {
        props.onChange(menuItem, sourceNode, targetNode, edge, graph, apis);
        setVisible(false);
      }
    } else {
      message.warning('Cannot catch the changes.');
    }
  };

  return visible ? (
    <AntdMenu
      items={options.filter((item) => {
        return !item.hidden;
      })}
      onClick={(menuInfo) => {
        onChange(menuInfo.key);
      }}
      getPopupContainer={(triggerNode) => {
        return (triggerNode.parentNode as HTMLElement) || document.body;
      }}
    />
  ) : null;
};

type NodeMenuProps = {
  onChange?: OnNodeMenuClickFn;
  chatbotVisible?: boolean;
  item?: IG6GraphEvent['item'];
};

// Add menu items for the node. If you want to some functions executed when a node is clicked, you can add the function here.
// Some functions are related with graph styles, so we only need to add handler functions in this component, otherwises we need to add the handler functions in the parent component.
const NodeMenu = (props: NodeMenuProps) => {
  const { graph, apis } = useContext(GraphinContext);
  const { item, chatbotVisible } = props;

  const [visible, setVisible] = useState<boolean>(false);

  console.log('NodeMenu', props.item);

  const [node, setNode] = useState<GraphNode | undefined>(undefined);

  useEffect(() => {
    if (item && item._cfg) {
      const nodeModel = item.getModel() as GraphNode;

      // Don't worry about the type of nodeModel.
      setNode(nodeModel);
      setVisible(true);
    } else {
      setVisible(false);
      setNode(undefined);
    }
  }, []);

  const options: MenuItem[] = [
    {
      key: 'show-node-details',
      icon: <InfoCircleFilled />,
      label: 'Show Node Details',
    },
    {
      key: 'expand-one-step',
      icon: <ExpandAltOutlined />,
      label: 'Expand One Step',
    },
    {
      key: 'find-similar-nodes',
      icon: <AimOutlined />,
      label: 'Find Similar Nodes',
    },
    {
      key: 'expand-selected-nodes',
      hidden: true,
      icon: <FullscreenOutlined />,
      label: 'Expand Selected Nodes',
    },
    {
      key: 'reverse-selected-nodes',
      icon: <CloseCircleOutlined />,
      label: 'Reverse Selected Nodes',
      handler: (node: GraphNode) => {
        graph.getNodes().forEach((node) => {
          if (node.hasState('selected')) {
            graph.setItemState(node, 'selected', false);
          } else {
            graph.setItemState(node, 'selected', true);
          }
        });

        if (node) {
          // Reset the status of the current node to unselected, even if it is not selected.
          graph.setItemState(node.id, 'selected', false);
        }

        setVisible(false);
      },
    },
    {
      key: 'predict-relationships',
      hidden: true,
      icon: <CloudServerOutlined />,
      label: 'Predict Relationships',
    },
    {
      key: 'visulize-similarities',
      icon: <DotChartOutlined />,
      label: 'Visualize Similarities',
    },
    {
      key: 'expand-all-paths',
      hidden: false,
      icon: <ShareAltOutlined />,
      label: 'Expand Paths (Within 2 Steps)',
      children: [
        {
          key: 'expand-all-paths-1',
          icon: <ShareAltOutlined />,
          label: 'Within 1 Step',
        },
        {
          key: 'expand-all-paths-2',
          icon: <ShareAltOutlined />,
          label: 'Within 2 Step',
        },
        // {
        //   key: 'expand-all-paths-3',
        //   hidden: true,
        //   icon: <ShareAltOutlined />,
        //   label: 'Within 3 Step',
        // },
      ],
    },
    // TODO: Cann't remove badges. It seems there is a bug in Graphin.
    // {
    //   key: 'tag',
    //   icon: <TagFilled />,
    //   label: 'Tag Node',
    //   children: [
    //     {
    //       key: 'tag-imported-nodes',
    //       icon: <TagFilled color="grey" />,
    //       label: 'Imported Nodes (Marked as M)',
    //       handler: (node: GraphNode) => {
    //         const seletedNodes = graph.getNodes().filter((node) => {
    //           return node.hasState('selected');
    //         });

    //         if (seletedNodes.length >= 1) {
    //           seletedNodes.map((node) => {
    //             graph.updateItem(node, {
    //               style: {
    //                 badges: [
    //                   // I: Imported
    //                   getDefaultBadge('grey', 'M'),
    //                 ],
    //               },
    //             });
    //           });
    //         } else {
    //           graph.updateItem(node.id, {
    //             style: {
    //               badges: [
    //                 // I: Imported
    //                 getDefaultBadge('grey', 'M'),
    //               ],
    //             },
    //           });
    //         }
    //       },
    //     },
    //     {
    //       key: 'tag-interested-nodes',
    //       icon: <TagFilled color="grey" />,
    //       label: 'Interested Nodes (Marked as I)',
    //       handler: (node: GraphNode) => {
    //         const seletedNodes = graph.getNodes().filter((node) => {
    //           return node.hasState('selected');
    //         });

    //         if (seletedNodes.length >= 1) {
    //           seletedNodes.map((node) => {
    //             graph.updateItem(node, {
    //               style: {
    //                 badges: [
    //                   // I: Imported
    //                   getDefaultBadge('grey', 'I'),
    //                 ],
    //               },
    //             });
    //           });
    //         } else {
    //           graph.updateItem(node.id, {
    //             style: {
    //               badges: [
    //                 // I: Imported
    //                 getDefaultBadge('grey', 'I'),
    //               ],
    //             },
    //           });
    //         }
    //       },
    //     },
    //   ],
    // },
    {
      key: 'delete-nodes',
      icon: <DeleteFilled />,
      label: 'Delete Selected Node(s)',
      danger: true,
    },
  ];

  if (chatbotVisible) {
    options.push({
      key: 'ask-question',
      icon: <QuestionCircleOutlined />,
      label: 'Ask Chatbot',
      children: [
        {
          key: 'what-is-the-node',
          icon: <InfoCircleFilled />,
          label: `What is the node?`,
        },
      ],
    });
  }

  const onChange = function (menuKey: string) {
    const childOptions = options
      .filter((item) => {
        return item.children;
      })
      .map((item) => {
        return item.children;
      })
      .flat();

    const allOptions = options.filter((item) => {
      return !item.children;
    });

    const menuItem =
      allOptions.find((item) => {
        return item.key === menuKey;
      }) ||
      childOptions.find((item) => {
        if (item) {
          return item.key === menuKey;
        } else {
          return false;
        }
      });

    console.log('NodeMenu: ', menuKey, menuItem);

    if (menuItem) {
      // Only need to change the status of the nodes, so no need to call the onChange function.
      if (menuItem.handler) {
        menuItem.handler(node);
      } else {
        if (props.onChange && node && graph && apis) {
          props.onChange(menuItem, node, graph, apis);
          setVisible(false);
        } else {
          message.warning('Cannot catch the changes.');
        }
      }
    } else {
      console.log('Cannot find the menu item: ', menuKey, options);
      // TODO: It doesn't happen.
      message.warning('Cannot catch the changes.');
    }
  };

  return visible ? (
    <AntdMenu
      items={options.filter((item) => {
        return !item.hidden;
      })}
      onClick={(menuInfo) => {
        onChange(menuInfo.key);
      }}
      getPopupContainer={(triggerNode) => {
        return (triggerNode.parentNode as HTMLElement) || document.body;
      }}
    />
  ) : null;
};

type CanvasMenuProps = {
  onCanvasClick?: OnCanvasMenuClickFn;
  handleOpenFishEye?: () => void;
  onClearGraph?: () => void;
};

const CanvasMenu = (props: CanvasMenuProps) => {
  const { graph, contextmenu, apis } = useContext(GraphinContext);
  const context = contextmenu.canvas;
  const handleDownloadCanvas = (item: CanvasMenuItem) => {
    if (graph.getNodes().length == 0) {
      message.warning('No data to download');
      return;
    }

    graph.downloadFullImage('canvas', 'image/png', {
      backgroundColor: '#fff',
      padding: 10,
    });
    context.handleClose();
  };

  const handleDownloadData = (item: CanvasMenuItem) => {
    const payload = prepareGraphData(graph);

    if (payload.data.nodes.length == 0) {
      message.warning('No data to download');
      return;
    }

    // @ts-ignore
    const json: GraphItem = {
      payload: payload,
      name: 'shared-graph',
      description: 'Shared graph',
    };
    // Download data as json file
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'graph.json';
    link.click();
  };

  const handleAutoConnect = (item: CanvasMenuItem) => {
    if (props.onCanvasClick) {
      props.onCanvasClick(item, graph, apis);
    }
  };

  const handleClear = (item: CanvasMenuItem) => {
    // TODO: It doesn't work well. why?
    // graph.clear();
    if (props.onClearGraph) {
      props.onClearGraph();
      // We must clear the stack manually, otherwise the stack will be not consistent with the graph.
      graph.clearStack();
      message.info(`Clear canvas successfully`);
    } else {
      message.warning(`Cannot clear canvas`);
    }
    context.handleClose();
  };

  // const handleStopLayout = (item: CanvasMenuItem) => {
  //     message.info(`Stop layout successfully`);
  //     graph.stopAnimate();
  //     context.handleClose();
  // };

  const handleOpenFishEye = (item: CanvasMenuItem) => {
    if (props.handleOpenFishEye) {
      props.handleOpenFishEye();
    }
  };

  const handleClearNodeEdgeStatus = (item: CanvasMenuItem) => {
    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      graph.setItemState(node, 'inactive', false);
      graph.setItemState(node, 'active', false);

      // Some nodes are hidden, so we need to show them.
      graph.showItem(node, true);
    });

    const edges = graph.getEdges();
    edges.forEach((edge) => {
      graph.setItemState(edge, 'inactive', false);
      graph.setItemState(edge, 'active', false);

      // Some edges are hidden, so we need to show them.
      graph.showItem(edge, true);
    });

    message.success(`Clear node/edge status successfully`);

    if (props.onCanvasClick) {
      props.onCanvasClick(item, graph, apis);
    }
  };

  const options: CanvasMenuItem[] = [
    {
      key: 'auto-connect',
      icon: <ForkOutlined />,
      name: 'Auto Connect Graph',
      handler: handleAutoConnect,
    },
    {
      key: 'enable-fish-eye',
      icon: <EyeOutlined />,
      name: 'Enable FishEye',
      handler: handleOpenFishEye,
    },
    {
      key: 'download-data',
      icon: <DownloadOutlined />,
      name: 'Download Graph Data',
      handler: handleDownloadData,
    },
    {
      key: 'download-canvas',
      icon: <CloudDownloadOutlined />,
      name: 'Save As Image',
      handler: handleDownloadCanvas,
    },
    {
      key: 'clear-node-edge-status',
      icon: <DeleteOutlined />,
      name: 'Clear Node/Edge Status',
      handler: handleClearNodeEdgeStatus,
    },
    // {
    //   key: 'clear-node-badges',
    //   icon: <DeleteOutlined />,
    //   name: 'Clear Node Tags',
    //   handler: (item: CanvasMenuItem) => {
    //     const nodes = graph.getNodes();
    //     nodes.forEach((node) => {
    //       const style = node.getOriginStyle();
    //       graph.updateItem(node, {
    //         style: {
    //           ...style,
    //           badges: [],
    //         },
    //       });
    //       node.refresh();
    //       node.setOriginStyle();
    //     });
    //     message.success(`Clear node tags successfully`);
    //   },
    // },
    {
      key: 'clear-canvas',
      icon: <DeleteOutlined />,
      name: 'Clear Canvas',
      danger: true,
      handler: handleClear,
    },
  ];

  return (
    <Menu
      bindType="canvas"
      options={options}
      onChange={(item, data) => {
        if (item.handler) {
          item.handler(item, graph, apis);
        }
      }}
    />
  );
};

const CustomHoverable = (props: { bindType?: 'node' | 'edge'; disabled?: boolean }) => {
  const { bindType, disabled } = props;
  const { graph } = useContext(GraphinContext);
  const [enableHoverable, setEnableHoverable] = useState<boolean>(false);

  // TODO: How to disable hoverable when there are multiple nodes selected?
  // useEffect(() => {
  //     const selectedNodes = graph.getNodes().filter(node => {
  //         return node.getStates().includes('selected')
  //     })
  //     setEnableHoverable(selectedNodes.length > 1)
  // }, [])

  return <Hoverable bindType={bindType} disabled={enableHoverable || disabled} />;
};

const NodeLabelVisible = (props: { visible: boolean }) => {
  const { visible } = props;

  const graph = useContext(GraphinContext).graph;

  useEffect(() => {
    graph.getNodes().forEach((node) => {
      graph.updateItem(node, {
        style: {
          // @ts-ignore
          label: {
            visible: visible,
          },
        },
      });
    });
  }, [visible]);
  return null;
};

const EdgeLabelVisible = (props: { visible: boolean }) => {
  const { visible } = props;
  const graph = useContext(GraphinContext).graph;

  useEffect(() => {
    graph.getEdges().forEach((edge) => {
      graph.updateItem(edge, {
        style: {
          // @ts-ignore
          label: {
            visible: visible,
          },
        },
      });
    });
  }, [visible]);
  return null;
};

const HighlightNodeEdge = (props: { selectedNodes: string[]; selectedEdges: string[] }) => {
  console.log('HighlightNodeEdge: ', props.selectedNodes);
  const { graph } = useContext(GraphinContext);
  if (props.selectedNodes.length > 0) {
    // More details on https://graphin.antv.vision/graphin/quick-start/interface and https://graphin.antv.vision/graphin/render/status
    // When user select multiple nodes, we need to highlight the selected nodes and disable the other nodes.
    showSelectedNodes(props.selectedNodes, graph, true);
  } else {
    showAllNodes(graph);
  }

  // TODO: How to highlight the selected edges?
  if (props.selectedEdges.length > 0) {
    const selectedEdges = props.selectedEdges;
    // More details on https://graphin.antv.vision/graphin/render/status

    showSelectedEdges(selectedEdges, graph, true);
  }

  if (props.selectedNodes.length == 0 && props.selectedEdges.length == 0) {
    showAllEdges(graph);
  }

  return null;
};

const FocusBehavior = (props: {
  queriedId?: string;
  onClickNode?: (nodes: GraphNode) => void;
  mode?: 'select' | 'focus';
}) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    // 初始化聚焦到查询节点
    if (props.queriedId && props.mode == 'focus') {
      apis.focusNodeById(props.queriedId);
    }

    const handleClick = (evt: IG6GraphEvent) => {
      const node = evt.item as INode;
      const model = node.getModel() as NodeConfig;

      if (props.mode == 'focus') {
        apis.focusNodeById(model.id);
      }

      if (props.onClickNode) {
        props.onClickNode(node.getModel() as GraphNode);
      }
    };

    // 每次点击聚焦到点击节点上
    graph.on('node:click', handleClick);

    return () => {
      graph.off('node:click', handleClick);
    };
  }, []);

  return null;
};

const NodeClickBehavior = (props: { onClick?: OnClickNodeFn }) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    const handleClick = (evt: IG6GraphEvent) => {
      if (props.onClick) {
        const node = evt.item as INode;
        const model = node.getModel() as GraphNode;
        props.onClick(model.id, model);
      }
    };

    graph.on('node:click', handleClick);
    return () => {
      graph.off('node:click', handleClick);
    };
  }, []);
  return null;
};

const EdgeClickBehavior = (props: { onClick?: OnClickEdgeFn }) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    const handleClick = (evt: IG6GraphEvent) => {
      if (props.onClick) {
        const edge = evt.item as IEdge;
        const model = edge.getModel() as GraphEdge;
        const startNode = graph.findById(model.source).getModel() as GraphNode;
        const endNode = graph.findById(model.target).getModel() as GraphNode;
        props.onClick(model.relid, startNode, endNode, model);
      }
    };

    graph.on('edge:click', handleClick);
    return () => {
      graph.off('edge:click', handleClick);
    };
  }, []);
  return null;
};

type NodeSearcherProps = {
  changeSelectedNodes?: (selectedNodes: string[]) => void;
  changeSelectedEdges?: (selectedEdges: string[]) => void;
};

const NodeSearcher: React.FC<NodeSearcherProps> = (props) => {
  const { graph, apis } = useContext(GraphinContext);
  const { undo, getUndoStack, redo, getRedoStack } = UndoRedo();

  const [searchLoading, setSearchLoading] = useState(false);
  const [nodeOptions, setNodeOptions] = useState<any[]>([]);

  const handleNodeSelectorChange = (value: string) => {
    console.log('handleNodeSelectorChange: ', value);
    if (value) {
      apis.focusNodeById(value);
    }
  };

  const handleNodeSearch = (value: string) => {
    console.log('handleNodeSearch: ', value);
    setSearchLoading(true);
    if (value) {
      const nodeOptions: any[] = [];
      graph.getNodes().forEach((node) => {
        const model = node.getModel() as NodeConfig & GraphNode;
        console.log('handleNodeSearch: ', model);
        if (
          (model.label && model.label.toLowerCase().includes(value.toLowerCase())) ||
          (model.data.name && model.data.name.toLowerCase().includes(value.toLowerCase()))
        ) {
          nodeOptions.push({
            label: `${model.id} | ${model.data.name}`,
            value: model.id,
          });
        }
      });
      setNodeOptions(nodeOptions);
      setSearchLoading(false);
    } else {
      setNodeOptions([]);
      setSearchLoading(false);
    }
  };

  return (
    <Row className="node-searcher">
      <ButtonGroup>
        <Button
          shape="circle"
          icon={<UndoOutlined />}
          onClick={() => {
            undo(
              (nodes) => {
                props.changeSelectedNodes && props.changeSelectedNodes(nodes);
              },
              (edges) => {
                props.changeSelectedEdges && props.changeSelectedEdges(edges);
              },
            );
          }}
          // The first item in the stack is the initial layout, so we don't need to undo it.
          disabled={getUndoStack().length <= 1}
        ></Button>
        <Button
          shape="circle"
          icon={<RedoOutlined />}
          onClick={() => {
            redo(
              (nodes) => {
                props.changeSelectedNodes && props.changeSelectedNodes(nodes);
              },
              (edges) => {
                props.changeSelectedEdges && props.changeSelectedEdges(edges);
              },
            );
          }}
          disabled={getRedoStack().length < 1}
        ></Button>
      </ButtonGroup>
      <Select
        showSearch
        allowClear
        loading={searchLoading}
        defaultActiveFirstOption={false}
        showArrow={true}
        placement={'topRight'}
        placeholder={'Search nodes'}
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        onSearch={handleNodeSearch}
        onChange={handleNodeSelectorChange}
        options={nodeOptions}
        filterOption={false}
        notFoundContent={
          <Empty
            description={
              searchLoading
                ? 'Searching...'
                : nodeOptions !== undefined
                ? 'Not Found or Too Short Input'
                : `Enter your interested node ...`
            }
          />
        }
      ></Select>
    </Row>
  );
};

export type GraphinProps = {
  selectedNodes?: string[];
  changeSelectedNodes?: (selectedNodes: string[]) => void;
  selectedEdges?: string[];
  changeSelectedEdges?: (selectedEdges: string[]) => void;
  data: GraphData;
  layout: Layout;
  style: React.CSSProperties;
  containerId?: string;
  onNodeMenuClick?: OnNodeMenuClickFn;
  onEdgeMenuClick?: OnEdgeMenuClickFn;
  onCanvasMenuClick?: OnCanvasMenuClickFn;
  queriedId?: string;
  statistics: any;
  chatbotVisible?: boolean;
  layoutSettingPanelVisible?: boolean;
  hideWhichPanel?: (panelKey: string) => void;
  toolbarVisible?: boolean;
  onClickNode?: OnClickNodeFn;
  onClickEdge?: OnClickEdgeFn;
  onClearGraph?: () => void;
  className?: string;
  children?: React.ReactNode;
};

type GraphinSettings = {
  autoPin: boolean;
  nodeLabelVisible: boolean;
  edgeLabelVisible: boolean;
  nodeTooltipEnabled: boolean;
  edgeTooltipEnabled: boolean;
  selectionMode: string;
  interactiveMode: 'show-details' | 'show-paths' | 'select-nodes';
  miniMapEnabled: boolean;
  snapLineEnabled: boolean;
  infoPanelEnabled: boolean;
};

const defaultSettings: GraphinSettings = {
  autoPin: false,
  nodeLabelVisible: true,
  edgeLabelVisible: true,
  nodeTooltipEnabled: true,
  edgeTooltipEnabled: false,
  interactiveMode: 'select-nodes',
  selectionMode: 'brush-select',
  miniMapEnabled: true,
  snapLineEnabled: true,
  infoPanelEnabled: true,
};

const GraphinWrapper: React.FC<GraphinProps> = (props) => {
  const {
    data,
    style,
    onNodeMenuClick,
    onEdgeMenuClick,
    selectedNodes,
    onCanvasMenuClick,
    selectedEdges,
  } = props;
  const [fishEyeVisible, setFishEyeVisible] = useState(false);
  const [explanationPanelVisible, setExplanationPanelVisible] = useState(false);

  const [settings, setSettings] = useState<GraphinSettings>({} as GraphinSettings);
  const [dataLayoutChangedBefore, setDataLayoutChangedBefore] = useState<GraphData | null>(null);
  // Don't use setLayout to change the layout, we must use changeLayout function for making the undo/redo work.
  const [layout, setLayout] = React.useState<Layout>({
    // The random layout will be used if the layout is not specified.
    type: props.layout.type,
    options: {
      ...(props.layout.options || {}),
    },
  });

  const [currentEdge, setCurrentEdge] = useState<any>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [focusedNodes, setFocusedNodes] = useState<GraphNode[]>([]);
  const [adjacencyList, setAdjacencyList] = useState<AdjacencyList>({} as AdjacencyList); // Adjacency list for the current graph

  const ref = React.useRef(null);
  const dataLayoutChangedBeforeRef = React.useRef(dataLayoutChangedBefore);

  useEffect(() => {
    dataLayoutChangedBeforeRef.current = dataLayoutChangedBefore;
  }, [dataLayoutChangedBefore]);

  const toolbarHelpDoc = (
    <p style={{ width: '400px' }}>
      If you would like to select multiple nodes, please set the interactive mode to "select-nodes".
      Then press the "Shift" key and click the nodes you want to select.
    </p>
  );

  const layoutHelpDoc = (
    <p style={{ width: '400px' }}>
      If you would like to change the layout, please click the "Layout Type" button and select a new
      layout. After that, you can change the layout settings.
    </p>
  );

  // All initializations
  // Save the node or edge when the context menu is clicked.
  useEffect(() => {
    loadSettings();

    // @ts-ignore
    if (ref && ref.current && ref.current.graph) {
      // @ts-ignore
      ref.current.graph.on('edge:contextmenu', (e) => {
        setCurrentEdge(e.item);
      });
      // @ts-ignore
      ref.current.graph.on('node:contextmenu', (e) => {
        setCurrentNode(e.item);
      });
    }
  }, []);

  useEffect(() => {
    // We need to clear the focused nodes when the interactive mode is changed.
    // otherwise the focused nodes will be kept and make the focus mode not work.
    setFocusedNodes([]);
  }, [settings.interactiveMode]);

  const hasPostions = (data: GraphData) => {
    return data.nodes.every((node) => {
      return node.x && node.x > 0 && node.y && node.y > 0;
    });
  };

  useEffect(() => {
    // create a map to hold the adjacency list
    const adjacencyList = new Map();
    for (const node of data.nodes) {
      adjacencyList.set(node.id, []);
    }
    for (const edge of data.edges) {
      adjacencyList.get(edge.source).push(edge.target);
      adjacencyList.get(edge.target).push(edge.source);
    }
    setAdjacencyList(adjacencyList);

    if (!hasPostions(data) && !layout.type) {
      changeLayout({ type: 'random', options: { preventOverlap: true } });
    }
  }, [data]);

  const handleOpenFishEye = () => {
    setFishEyeVisible(true);
  };

  const onCloseFishEye = () => {
    setFishEyeVisible(false);
  };

  const onClickNodeInFocusMode = (node: GraphNode) => {
    setFocusedNodes((prevState) => [...prevState, node]);
  };

  const onClosePathsFinder = () => {
    setFocusedNodes([]);
  };

  const HoverText: React.FC<{ data: Record<string, any>; style: any }> = ({ data, style }) => {
    console.log('HoverText: ', data);
    const dataSource = makeDataSource(data, [
      'comboId',
      'degree',
      'depth',
      'layoutOrder',
      'x',
      'y',
      'type',
      'category',
      'nlabel',
      'identity',
    ]);
    const items = Object.keys(dataSource).map((key) => {
      if (dataSource[key]) {
        return (
          <Descriptions.Item
            key={key}
            label={voca.titleCase(key)}
            style={{ height: '50px', overflowY: 'scroll' }}
          >
            {dataSource[key]}
          </Descriptions.Item>
        );
      } else {
        return null;
      }
    });
    return items.length > 0 ? (
      <Descriptions size={'small'} column={1} title={null} bordered style={style}>
        {items}
      </Descriptions>
    ) : (
      <span style={style}>No Properties</span>
    );
  };

  const onChangeLegend = (checkedValue: LegendOptionType, options: LegendOptionType[]) => {
    console.log(checkedValue, options);
  };

  const loadSettings = (settingId: string = 'graphin-settings') => {
    const settings = JSON.parse(localStorage.getItem(settingId) || '{}');
    if (Object.keys(settings).length === 0) {
      setSettings(defaultSettings);
    } else {
      setSettings(settings);
      message.success('Settings loaded');
    }
  };

  const changeLayout = (value: Layout) => {
    // @ts-ignore
    if (ref.current && ref.current.graph) {
      // Save the current graph data before layout for undo/redo
      // @ts-ignore
      let data = ref.current.graph.save() as GraphData;
      setDataLayoutChangedBefore(JSON.parse(JSON.stringify(data)));
    }
    console.log('Layout Settings: ', value);
    setLayout(value);
  };

  return (
    data && (
      <Graphin
        ref={ref}
        enabledStack={true}
        data={data as GraphinData}
        // We will set the layout manually for more flexibility.
        layout={layout}
        handleAfterLayout={(graph) => {
          console.log(
            'handleAfterLayout -> layoutChanged: ',
            dataLayoutChangedBefore,
            dataLayoutChangedBeforeRef.current,
            graph.get('layout'),
          );
          // Graphin don't save the related data when the layout is changed, so we need to save the related data manually.
          if (dataLayoutChangedBeforeRef.current) {
            const undoStackData = graph.getUndoStack();
            const afterData = graph.save() as GraphinData;
            console.log(
              'handleAfterLayout -> undoStackData -> old + new: ',
              dataLayoutChangedBeforeRef.current,
              afterData,
            );
            const currentDataInStack = popCurrectData(graph, undoStackData);

            const currentData = currentDataInStack.data;
            let data = {
              before: {
                ...currentData.before,
                data: dataLayoutChangedBeforeRef.current,
              },
              after: {
                ...currentData.after,
                data: afterData,
              },
            };

            console.log(
              'handleAfterLayout -> undoStackData -> newUndo: ',
              data,
              afterData,
              dataLayoutChangedBeforeRef.current,
            );
            graph.pushStack(currentDataInStack.action, data, 'undo');

            setDataLayoutChangedBefore(null);
          }

          console.log('handleAfterLayout: ', graph.getStackData());
        }}
        style={style}
        // You can increase the maxStep if you want to save more history steps.
        maxStep={20}
      >
        <FitView></FitView>
        {/* You can drag node to stop layout */}
        <DragNodeWithForce autoPin={true} />
        {/* TODO: Cannot work. To expect all linked nodes follow the draged node. */}
        {/* <DragNode /> */}
        <ZoomCanvas />
        {settings.selectionMode == 'lasso-select' ? <LassoSelect /> : null}
        {settings.selectionMode == 'brush-select' ? <BrushSelect /> : null}
        <NodeLabelVisible visible={settings.nodeLabelVisible} />
        {/* BUG: Cannot restore the label of edges */}
        <EdgeLabelVisible visible={settings.edgeLabelVisible} />
        <FishEye options={{}} visible={fishEyeVisible} handleEscListener={onCloseFishEye} />
        <HighlightNodeEdge
          selectedNodes={selectedNodes || []}
          selectedEdges={selectedEdges || []}
        />
        {settings.interactiveMode == 'show-paths' ? <CustomHoverable bindType="node" /> : null}
        {settings.interactiveMode == 'show-paths' ? <CustomHoverable bindType="edge" /> : null}
        {settings.interactiveMode == 'show-paths' ? <ActivateRelations /> : null}
        <ContextMenu style={{ width: '160px' }}>
          <NodeMenu
            chatbotVisible={props.chatbotVisible}
            item={currentNode}
            onChange={(menuItem, data, graph, graphin) => {
              // Clear the current node when the context menu is closed, elsewise the node menu cannot be opened again.
              setCurrentNode(null);
              onNodeMenuClick && onNodeMenuClick(menuItem, data, graph, graphin);
            }}
          />
        </ContextMenu>
        <ContextMenu style={{ width: '160px' }} bindType="canvas">
          <CanvasMenu
            handleOpenFishEye={handleOpenFishEye}
            onCanvasClick={(menuItem, graph, graphin) => {
              // Clear the current node & edge when the context menu is closed
              setCurrentNode(null);
              setCurrentEdge(null);
              onCanvasMenuClick && onCanvasMenuClick(menuItem, graph, graphin);
            }}
            onClearGraph={props.onClearGraph}
          />
        </ContextMenu>
        <ContextMenu style={{ width: '160px' }} bindType="edge">
          <EdgeMenu
            item={currentEdge}
            chatbotVisible={props.chatbotVisible}
            onChange={(menuItem, source, target, edge, graph, apis) => {
              // Clear the current edge when the context menu is closed, elsewise the edge menu cannot be opened again.
              setCurrentEdge(null);

              // TODO: How to generate explanation report for the edge?
              if (menuItem.key == 'explain-relationship') {
                setCurrentEdge(edge);
                setExplanationPanelVisible(true);
              }

              if (onEdgeMenuClick) {
                onEdgeMenuClick(menuItem, source, target, edge, graph, apis);
              }
            }}
          />
        </ContextMenu>
        <Legend bindType="node" sortKey="nlabel">
          {(renderProps: LegendChildrenProps) => {
            console.log('renderProps', renderProps);
            return <Legend.Node {...renderProps} onChange={onChangeLegend} />;
          }}
        </Legend>
        {props.layoutSettingPanelVisible ? (
          <Moveable
            title="Layout Settings"
            width="320px"
            maxWidth="320px"
            top="100px"
            right="140px"
            help={layoutHelpDoc}
            onClose={() => {
              props.hideWhichPanel ? props.hideWhichPanel('layoutSettingPanel') : null;
            }}
          >
            <LayoutSelector type={layout.type} layouts={LayoutNetwork} onChange={changeLayout} />
          </Moveable>
        ) : null}
        {props.toolbarVisible ? (
          <Moveable
            title="Settings"
            width="220px"
            maxWidth="220px"
            top="100px"
            right="30px"
            help={toolbarHelpDoc}
            onClose={() => {
              props.hideWhichPanel ? props.hideWhichPanel('toolbar') : null;
            }}
          >
            <Toolbar
              style={{
                // Remove absolute position to make it work with the Moveable component.
                position: 'relative',
                marginBottom: '0px',
                opacity: 0.8,
              }}
              direction="horizontal"
            >
              <Toolbar.Item>
                <Select
                  style={{ width: '100%' }}
                  allowClear
                  value={settings.interactiveMode}
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode;
                  }}
                  onChange={(value) => {
                    setSettings({ ...settings, interactiveMode: value as any });
                  }}
                  placeholder="Select a interactive mode"
                >
                  {['show-details', 'select-nodes', 'show-paths'].map((item) => {
                    return (
                      <Select.Option key={item} value={item}>
                        <ForkOutlined />
                        &nbsp;
                        {voca.titleCase(item)}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Toolbar.Item>
              <Toolbar.Item>
                <Select
                  style={{ width: '100%' }}
                  allowClear
                  defaultValue={'brush-select'}
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode;
                  }}
                  disabled={settings.interactiveMode !== 'select-nodes'}
                  onChange={(value) => {
                    setSettings({ ...settings, selectionMode: value });
                  }}
                  placeholder="Select a selection mode"
                >
                  {['brush-select', 'lasso-select'].map((item) => {
                    return (
                      <Select.Option key={item} value={item}>
                        <ForkOutlined />
                        &nbsp;
                        {voca.titleCase(item)}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Toolbar.Item>
              {/* <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, autoPin: checked });
                  }}
                  checked={settings.autoPin}
                  disabled
                />
                Auto Pin
              </Toolbar.Item> */}
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, nodeLabelVisible: checked });
                  }}
                  checked={settings.nodeLabelVisible}
                />
                Node Label
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, edgeLabelVisible: checked });
                  }}
                  checked={settings.edgeLabelVisible}
                />
                Edge Label
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, nodeTooltipEnabled: checked });
                  }}
                  checked={settings.nodeTooltipEnabled}
                />
                Node Tooltip
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, edgeTooltipEnabled: checked });
                  }}
                  checked={settings.edgeTooltipEnabled}
                />
                Edge Tooltip
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, miniMapEnabled: checked });
                  }}
                  checked={settings.miniMapEnabled}
                />
                MiniMap
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, snapLineEnabled: checked });
                  }}
                  checked={settings.snapLineEnabled}
                />
                SnapLine
              </Toolbar.Item>
              <Toolbar.Item>
                <Switch
                  onChange={(checked) => {
                    setSettings({ ...settings, infoPanelEnabled: checked });
                  }}
                  checked={settings.infoPanelEnabled}
                />
                Info Panel
              </Toolbar.Item>
              <Toolbar.Item>
                <Button
                  type="primary"
                  size="small"
                  style={{ width: '100%' }}
                  onClick={() => {
                    localStorage.setItem('graphin-settings', JSON.stringify(settings));
                    message.success('Settings saved');
                  }}
                >
                  Save Settings
                </Button>
              </Toolbar.Item>
              <Toolbar.Item>
                <Button
                  danger
                  size="small"
                  style={{ width: '100%' }}
                  onClick={() => {
                    loadSettings();
                  }}
                >
                  Load Settings
                </Button>
              </Toolbar.Item>
            </Toolbar>
          </Moveable>
        ) : null}

        <NodeSearcher
          changeSelectedEdges={props.changeSelectedEdges}
          changeSelectedNodes={props.changeSelectedNodes}
        />

        {settings.interactiveMode == 'show-paths' ? (
          <FocusBehavior
            queriedId={props.queriedId}
            onClickNode={onClickNodeInFocusMode}
            mode={'focus'}
          />
        ) : null}

        {settings.interactiveMode == 'select-nodes' ? (
          <FocusBehavior
            queriedId={props.queriedId}
            onClickNode={onClickNodeInFocusMode}
            mode={'select'}
          />
        ) : null}

        {/* Only work at focus mode */}
        {settings.interactiveMode == 'show-paths' ? (
          <>
            <ShowPaths
              selectedNodes={focusedNodes}
              nodes={data.nodes}
              edges={data.edges}
              onClosePathsFinder={onClosePathsFinder}
              adjacencyList={adjacencyList}
              // TODO: hard code here, need to be fixed. If you choose dfs, it will be very slow. But we can get all paths. How to improve the performance or get all paths by using other methods?
              algorithm={data.edges.length > 1000 ? 'bfs' : 'dfs'}
            />
          </>
        ) : null}
        {
          // TODO: generate explanations for the current edge
          // 1. Get the current edge, the source node and target node
          // 2. Send the source node and target node to the backend and get the prompt (markdown format) which contains the prompt and api codes for retrieving context information
          // 3. Send the markdown to the backend and get the filled markdown
          // 4. Send the filled markdown to LLM and generate explanations by using `rethinking with retrieval` method
          // 5. Show the filled markdown in the explanation panel
          currentEdge && explanationPanelVisible ? (
            <Moveable
              onClose={() => {
                setExplanationPanelVisible(false);
              }}
            >
              <p>
                TODO: generate explanations for the current edge
                <br />
                1. Get the current edge, the source node and target node
                <br />
                2. Send the source node and target node to the backend and get the prompt (markdown
                format) which contains the prompt and api codes for retrieving context information
                <br />
                3. Send the markdown to the backend and get the filled markdown
                <br />
                4. Send the filled markdown to LLM and generate explanations by using `rethinking
                with retrieval` method
                <br />
                5. Show the filled markdown in the explanation panel
                <br />
              </p>
            </Moveable>
          ) : null
        }
        {settings.interactiveMode == 'select-nodes' ? (
          <ClickSelect multiple={true} trigger={'shift'}></ClickSelect>
        ) : null}
        {settings.interactiveMode == 'show-details' ? (
          <NodeClickBehavior onClick={props.onClickNode}></NodeClickBehavior>
        ) : null}
        {settings.interactiveMode == 'show-details' ? (
          <EdgeClickBehavior onClick={props.onClickEdge}></EdgeClickBehavior>
        ) : null}
        {settings.nodeTooltipEnabled ? (
          <Tooltip bindType="node" hasArrow placement="bottom" style={{ opacity: 0.9 }}>
            {(value: TooltipValue) => {
              if (value.model) {
                const { model } = value;
                return (
                  <HoverText
                    data={model}
                    style={{ padding: '10px', width: 'fit-content', maxWidth: '400px' }}
                  ></HoverText>
                );
              }
              return null;
            }}
          </Tooltip>
        ) : null}
        {settings.edgeTooltipEnabled ? (
          <Tooltip bindType="edge" hasArrow placement="bottom" style={{ opacity: 0.9 }}>
            {(value: TooltipValue) => {
              if (value.model) {
                const { model } = value;
                return (
                  <HoverText
                    data={model}
                    style={{ padding: '10px', width: 'fit-content' }}
                  ></HoverText>
                );
              }
              return null;
            }}
          </Tooltip>
        ) : null}
        {settings.miniMapEnabled ? <MiniMap /> : null}
        {settings.snapLineEnabled ? <SnapLine options={snapLineOptions} visible /> : null}
        {settings.infoPanelEnabled ? (
          <StatisticsDataArea
            data={props.statistics}
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              zIndex: 1,
            }}
          ></StatisticsDataArea>
        ) : null}
        <CustomGraphinContext.Provider
          value={{
            // @ts-ignore
            graph: ref.current?.graph,
            // @ts-ignore
            apis: ref.current?.apis,
            selectedNodes: focusedNodes,
          }}
        >
          {props.children ? props.children : null}
        </CustomGraphinContext.Provider>
      </Graphin>
    )
  );
};

export default GraphinWrapper;
