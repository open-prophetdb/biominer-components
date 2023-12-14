import React, { useContext, memo } from 'react';
import { GraphinContext } from '@antv/graphin';
import type { GraphNode, GraphEdge } from '../../typings';
import { Graph } from '@antv/g6';

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
      // hideRelatedEdges(node, graph);
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
      // showRelatedEdges(node, graph);
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

export default memo(HighlightNodeEdge);
