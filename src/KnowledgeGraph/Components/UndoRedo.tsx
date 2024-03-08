import { Stack } from '@antv/algorithm';
import { Graph, GraphData, GraphinContext, IG6GraphEvent } from '@antv/graphin';
import React from 'react';
import { pushStack } from '../../utils';

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

export const popCurrectData = (stack: Stack): any => {
    const currentData = stack.pop();
    return currentData;
};

type changeSelectedEdgesFn = (edges: string[]) => void;
type changeSelectedNodesFn = (nodes: string[]) => void;

const useRedoUndo = (): {
    redo: (
        changeSelectedNodes?: changeSelectedNodesFn,
        changeSelectedEdges?: changeSelectedEdgesFn,
    ) => void;
    undo: (
        changeSelectedNodes?: changeSelectedNodesFn,
        changeSelectedEdges?: changeSelectedEdgesFn,
    ) => void;
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

    const redo = (
        changeSelectedNodes?: changeSelectedNodesFn,
        changeSelectedEdges?: changeSelectedEdgesFn,
    ) => {
        const redoStack = graph.getRedoStack();
        const undoStack = graph.getUndoStack();
        console.log('Do redo action: ', redoStack.length, redoStack, undoStack, graph.getStackData());

        if (redoStack.isEmpty()) {
            return;
        }

        const currentData = popCurrectData(redoStack);
        console.log('Current redo item: ', currentData, graph.getStackData());

        if (currentData) {
            const { action } = currentData;
            let data = currentData.data.after;

            if (action === 'select-nodes') {
                // graph.pushStack(
                //   action,
                //   {
                //     ...currentData.data,
                //   },
                //   'undo',
                // );
                pushStack(
                    action,
                    {
                        ...currentData.data,
                    },
                    graph.getUndoStack(),
                );
                changeSelectedNodes?.(currentData.data.after);

                return;
            }

            if (action === 'select-edges') {
                // graph.pushStack(
                //   action,
                //   {
                //     ...currentData.data,
                //   },
                //   'undo',
                // );
                pushStack(
                    action,
                    {
                        ...currentData.data,
                    },
                    undoStack,
                );
                changeSelectedEdges?.(currentData.data.after.edges);
                changeSelectedNodes?.(currentData.data.after.nodes);

                return;
            }

            if (action === 'layout') {
                // graph.pushStack(action, currentData.data, 'undo');
                pushStack(action, currentData.data, undoStack);
                data = currentData.data.after.data;
            } else {
                // graph.pushStack(action, {
                //   ...currentData.data,
                //   after: fixNodePosition(graph, currentData.data.after),
                //   before: fixNodePosition(graph, currentData.data.before),
                // });
                pushStack(
                    action,
                    {
                        ...currentData.data,
                        after: fixNodePosition(graph, currentData.data.after),
                        before: fixNodePosition(graph, currentData.data.before),
                    },
                    undoStack,
                );
            }

            if (action === 'delete') {
                data = currentData.data.before;
            }
            update(action, data);
        }
    };

    const undo = (
        changeSelectedNodes?: changeSelectedNodesFn,
        changeSelectedEdges?: changeSelectedEdgesFn,
    ) => {
        const undoStack = graph.getUndoStack();
        console.log('Do undo action: ', undoStack, graph.getStackData());

        // The first item in the undo stack is the initial layout, so we don't need to undo it.
        if (!undoStack || undoStack.length === 1) {
            return;
        }

        const currentData = popCurrectData(undoStack);
        console.log('Current undo item: ', currentData, graph.getUndoStack());

        if (currentData) {
            const { action } = currentData;
            let data = currentData.data.before;

            if (action === 'select-nodes') {
                // graph.pushStack(
                //     action,
                //     {
                //         ...currentData.data,
                //     },
                //     'redo',
                // );
                changeSelectedNodes?.(currentData.data.before);

                return;
            }

            if (action === 'select-edges') {
                // graph.pushStack(
                //     action,
                //     {
                //         ...currentData.data,
                //     },
                //     'redo',
                // );
                changeSelectedEdges?.(currentData.data.before.edges);
                changeSelectedNodes?.(currentData.data.before.nodes);

                return;
            }

            if (action === 'layout') {
                // graph.pushStack(action, currentData.data, 'redo');
                // data = currentData.data.before.data;
                // We don't need to care about the layout action, because the layout action will cause the graph to be re-rendered.
                undo(changeSelectedNodes, changeSelectedEdges);
            } else {
                // graph.pushStack(
                //     action,
                //     {
                //         ...currentData.data,
                //         after: fixNodePosition(graph, currentData.data.after),
                //         before: fixNodePosition(graph, currentData.data.before),
                //     },
                //     'redo',
                // );
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