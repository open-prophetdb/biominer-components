import { Stack } from '@antv/algorithm';
import { Graph, GraphData, GraphinContext, IG6GraphEvent } from '@antv/graphin';
import React from 'react';

export interface Redo {
  visible: boolean;
  color: string;
  hasDivider: boolean;
}

//修复异常数据
const fixNodePosition = (graph: Graph, graphData: GraphData): GraphData => {
  const currentData = graph.save() as any;
  const nodeMap: any = {};
  currentData.nodes?.forEach((n: any) => {
    nodeMap[n.id] = n;
  });
  const nodes = graphData.nodes?.map((n: any) => {
    if (typeof n.x !== 'number' || typeof n.y !== 'number') {
      const node = nodeMap[n.id];
      if (node) {
        return {
          ...n,
          x: node.x,
          y: node.y,
        };
      } else {
        return {
          ...n,
          x: 0,
          y: 0,
        };
      }
    }
    return n;
  });
  return {
    ...graphData,
    nodes,
  };
};

export const removeLayoutAction = (oldStack: Stack): Stack => {
  const stack = new Stack();
  oldStack.toArray().forEach((item) => {
    const { action } = item;
    if (action !== 'layout') {
      stack.push(item);
    }
  });

  console.log('Remove layout action: ', oldStack.toArray(), stack.toArray());
  return stack;
};

export const popCurrectData = (graph: Graph, stack: Stack): any => {
  const currentData = stack.pop();

  console.log('Get stack data: ', graph.getStackData());
  return currentData;
};

const useRedoUndo = (): {
  redo: () => void;
  undo: () => void;
  getUndoStack: () => Stack;
  getRedoStack: () => Stack;
} => {
  const { graph } = React.useContext(GraphinContext);
  const [stackInfo, setStackInfo] = React.useState(() => {
    return {
      undoStack: graph.getUndoStack(),
      redoStack: graph.getRedoStack(),
    };
  });

  const redo = () => {
    const redoStack = graph.getRedoStack();
    console.log('Do redo action: ', redoStack, graph.getStackData());

    if (!redoStack || redoStack.length === 0) {
      return;
    }

    const currentData = popCurrectData(graph, redoStack);

    if (currentData) {
      const { action } = currentData;
      let data = currentData.data.after;

      if (action === 'layout') {
        graph.pushStack(
          action,
          {
            after: {
              ...currentData.data.after,
              data: fixNodePosition(graph, currentData.data.after.data),
            },
            before: {
              ...currentData.data.before,
              data: fixNodePosition(graph, currentData.data.before.data),
            },
          },
          'undo',
        );
        data = currentData.data.after.data;
      } else {
        graph.pushStack(action, {
          ...currentData.data,
          after: fixNodePosition(graph, currentData.data.after),
          before: fixNodePosition(graph, currentData.data.before),
        });
      }

      if (action === 'delete') {
        data = currentData.data.before;
      }
      update(action, data);
    }
  };

  const undo = () => {
    const undoStack = graph.getUndoStack();
    console.log('Do undo action: ', undoStack, graph.getStackData());

    if (!undoStack || undoStack.length === 0) {
      return;
    }

    const currentData = popCurrectData(graph, undoStack);

    if (currentData) {
      const { action } = currentData;
      let data = currentData.data.before;
      if (action === 'layout') {
        graph.pushStack(
          action,
          {
            after: {
              ...currentData.data.after,
              data: fixNodePosition(graph, currentData.data.after.data),
            },
            before: {
              ...currentData.data.before,
              data: fixNodePosition(graph, currentData.data.before.data),
            },
          },
          'redo',
        );
        data = currentData.data.before.data;
      } else {
        graph.pushStack(
          action,
          {
            ...currentData.data,
            after: fixNodePosition(graph, currentData.data.after),
            before: fixNodePosition(graph, currentData.data.before),
          },
          'redo',
        );
      }

      if (action === 'add') {
        data = currentData.data.after;
      }
      update(action, data);
    }
  };

  const update = (action: string, data: GraphData) => {
    if (!data) return;

    switch (action) {
      case 'visible': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model: any) => {
            const item = graph.findById(model.id);
            if (!item) {
              return;
            }
            if (model.visible) {
              graph.showItem(item, false);
            } else {
              graph.hideItem(item, false);
            }
          });
        });
        break;
      }
      case 'render':
      case 'update':
        const nodeMap = graph.getNodes().reduce((map: any, node: any) => {
          map[node.getID()] = node;
          return map;
        }, {});
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model: any) => {
            if (nodeMap[model.id]) {
              graph.updateItem(model.id, model, false);
            }
          });
        });
        break;
      case 'changedata':
        // We must set the layout type to preset, because the layout action will cause the graph to be re-rendered.
        graph.updateLayout(
          {
            type: 'preset',
          },
          undefined,
          undefined,
          false,
        );
        graph.changeData(data, false);
        break;
      case 'delete': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model: any) => {
            const itemType = model.itemType;
            delete model.itemType;
            graph.addItem(itemType, model, false);
          });
        });
        break;
      }
      case 'add':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model: any) => {
            graph.removeItem(model.id, false);
          });
        });
        break;
      case 'updateComboTree':
        const comboMap: any = {};
        graph.getCombos().forEach((combo) => {
          comboMap[combo.getID()] = combo;
        });
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model: any) => {
            if (!comboMap[model.id] || (model.parentId && !comboMap[model.parentId])) {
              return;
            }
            graph.updateComboTree(model.id, model.parentId, false);
          });
        });
        break;
      case 'layout':
        console.log('Update layout: ', data);
        if (data) {
          // We must set the layout type to preset, because the layout action will cause the graph to be re-rendered.
          graph.updateLayout(
            {
              type: 'preset',
            },
            undefined,
            undefined,
            false,
          );
          graph.changeData(data, false);
        }
        break;
      default:
    }
  };

  React.useEffect(() => {
    const handleStackChange = (evt: IG6GraphEvent) => {
      const { undoStack, redoStack } = evt as any;
      setStackInfo({
        undoStack: undoStack,
        redoStack: redoStack,
      });
    };
    graph.on('stackchange', handleStackChange);
    return () => {
      graph.off('stackchange', handleStackChange);
    };
  }, [graph]);

  //@ts-ignore
  return {
    redo,
    undo,
    getUndoStack: () => stackInfo.undoStack,
    getRedoStack: () => stackInfo.redoStack,
  } as any;
};

export default useRedoUndo;
