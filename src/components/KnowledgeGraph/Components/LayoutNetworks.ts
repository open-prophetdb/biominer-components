export interface Option {
  key: string;
  title: string;
  defaultValue?: number | string | boolean;
  component: 'switch' | 'slider' | 'input' | 'select' | 'text';
  description?: string;

  /** 仅 select 时候有效，枚举值 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enums?: any[];

  /** 仅 slider 和input 的时候有效 */
  max?: number;
  min?: number;
  step?: number;
}

export type Layouts = {
  type: string;
  title: string;
  options?: Option[];
}[];

const layouts: Layouts = [
  {
    type: 'graphin-force',
    options: undefined,
    title: 'Progressive gForce',
  },
  {
    type: 'force',
    title: 'D3 gForce',
    options: [
      {
        key: 'preventOverlap',
        title: 'Prevent Overlap?',
        defaultValue: true,
        component: 'switch',
      },
      {
        key: 'linkDistance',
        title: 'Link Distance',
        defaultValue: 250,
        component: 'slider',
        min: 100,
        max: 500,
      },
      {
        key: 'nodeStrength',
        title: 'Node Strength',
        defaultValue: 30,
        component: 'slider',
        min: 10,
        max: 100,
      },
      {
        key: 'edgeStrength',
        title: 'Edge Strength',
        defaultValue: 0.1,
        component: 'slider',
        min: 0,
        max: 1,
      },
      {
        key: 'collideStrength',
        title: 'Collide Strength',
        defaultValue: 0.8,
        component: 'slider',
        max: 1,
        min: 0,
      },
    ],
  },
  {
    type: 'concentric',
    title: 'Concentric',
    options: [
      {
        component: 'slider',
        key: 'nodeSize',
        title: 'Node Size',
        defaultValue: 50,
        description: 'Node Size (Diameter) Used for Collision Detection to Prevent Node Overlap.',
      },
      {
        component: 'slider',
        key: 'minNodeSpacing',
        title: 'Min Node Spacing',
        defaultValue: 10,
        description: 'Minimum Spacing Between Rings to Adjust Radius, Default Value is 10.',
      },
      {
        component: 'switch',
        key: 'preventOverlap',
        title: 'Prevent Overlap?',
        defaultValue: true,
        description:
          'Prevent Overlapping, when set to true, it can avoid nodes overlapping with each other; nodeSize must be configured. Node collision detection will only occur when nodeSize is set to be consistent with node size.',
      },
      {
        component: 'slider',
        key: 'sweep',
        title: 'Sweep',
        defaultValue: undefined,
        min: 0,
        max: 10,
        description: 'Angular Difference Between the First Node and the Last Node.',
      },
      {
        component: 'switch',
        key: 'equidistant',
        title: 'Equidistant?',
        defaultValue: false,
        description:
          'Is the Distance Between Rings Equal, Default is False, Setting to True Creates Visual Uniformity',
      },
      {
        component: 'slider',
        key: 'startAngle',
        title: 'Start Angle',
        defaultValue: (3 / 2) * Math.PI,
        min: 0,
        max: 2 * Math.PI,
        step: 0.1 * Math.PI,
        description: 'The Default Starting Radian Value for Nodes is 3 / 2 * Math.PI.',
      },
      {
        component: 'switch',
        key: 'clockwise',
        title: 'Clockwise?',
        defaultValue: false,
        description: 'Is Arranged in Clockwise Direction, Default is False.',
      },
      {
        component: 'select',
        key: 'sortBy',
        title: 'Sort By',
        defaultValue: 'degree',
        enums: [
          { key: 'degree', value: 'degree' },
          { key: 'topology', value: 'topology' },
        ],
        description:
          "Specify the Sorting Criterion, i.e., a Node's Property Name; Higher Values Result in Nodes Being Placed More Centered.",
      },
    ],
  },
  {
    type: 'grid',
    options: [
      {
        component: 'slider',
        key: 'width',
        title: 'Width',
        defaultValue: 200,
        min: 10,
        max: 5000,
        description: 'The Width of the Layout',
      },
      {
        component: 'slider',
        key: 'height',
        title: 'Height',
        defaultValue: 200,
        min: 10,
        max: 5000,
        description: 'The Height of the Layout',
      },
      {
        component: 'switch',
        key: 'preventOverlap',
        title: 'Prevent Overlap?',
        defaultValue: false,
        description:
          'Prevent Node Overlap, when enabled, it avoids nodes from overlapping; it must be used in conjunction with the nodeSize property. Collision detection is only possible when the nodeSize is set to be the same size as the nodes in the graph.',
      },
      {
        component: 'slider',
        key: 'preventOverlapPadding',
        title: 'Prevent Overlap Padding',
        defaultValue: 10,
        min: 1,
        max: 100,
        description:
          'Spacing Value for Nodes When Avoiding Overlap, Active when preventOverlap is True',
      },
      {
        component: 'switch',
        key: 'condense',
        title: 'Condense?',
        defaultValue: false,
        description:
          'True for Utilizing the Minimum Canvas Space, False for Utilizing the Entire Available Canvas Size.',
      },
      {
        component: 'slider',
        key: 'rows',
        title: 'Grid Rows',
        defaultValue: 10,
        min: 1,
        max: 500,
        description: 'The Number of Rows in the Grid, Default is 10',
      },
      {
        component: 'slider',
        key: 'cols',
        title: 'Grid Columns',
        defaultValue: 10,
        min: 1,
        max: 500,
        description: 'The Number of Columns in the Grid, Default is 10',
      },
      {
        component: 'select',
        key: 'sortBy',
        title: 'Sort By',
        defaultValue: undefined,
        enums: [
          { key: null, value: null },
          { key: 'topology', value: 'topology' },
          { key: 'degree', value: 'degree' },
        ],
        description:
          "Specify the Sorting Criterion, i.e., based on which node property the sorting is performed; higher values result in nodes being placed more centrally. If not specified, the node's degree will be calculated, and nodes with higher degrees will be placed more centrally.",
      },
    ],
    title: 'Grid Layout',
  },
  {
    type: 'radial',
    options: undefined,
    title: 'Radial Layout',
  },
  {
    type: 'dagre',
    options: [
      {
        component: 'select',
        key: 'rankdir',
        title: 'Layout Direction',
        defaultValue: 'TB',
        enums: [
          { key: 'TB', value: 'TB' },
          { key: 'BT', value: 'BT' },
          { key: 'LR', value: 'LR' },
          { key: 'RL', value: 'RL' },
        ],
        description:
          'Layout Direction, Default is TB, which means top to bottom layout. TB represents top to bottom layout, BT represents bottom to top layout, LR represents left to right layout, and RL represents right to left layout.',
      },
      {
        component: 'select',
        key: 'align',
        title: 'Node Alignment',
        defaultValue: undefined,
        enums: [
          { key: null, value: null },
          { key: 'UL', value: 'UL' },
          { key: 'UR', value: 'UR' },
          { key: 'DL', value: 'DL' },
          { key: 'DR', value: 'DR' },
        ],
        description:
          'Node Alignment, Default is UL, meaning aligned to the upper-left corner. UL represents alignment to the upper-left corner, UR represents alignment to the upper-right corner, DL represents alignment to the lower-left corner, and DR represents alignment to the lower-right corner.',
      },
      {
        component: 'slider',
        key: 'nodeSize',
        title: 'Node Size',
        defaultValue: 0,
        max: 200,
        min: 0,
        description:
          'Node Size, Default is 0, which means the node size is automatically calculated based on the node label.',
      },
      {
        component: 'slider',
        key: 'nodesep',
        title: 'Node Spacing',
        defaultValue: 10,
        max: 200,
        min: 1,
        description:
          'Node Spacing, horizontal spacing when rankdir is TB or BT, and vertical spacing when rankdir is LR or RL.',
      },
      {
        component: 'input',
        key: 'ranksep',
        title: 'Rank Spacing',
        defaultValue: 10,
        max: 200,
        min: 1,
        description:
          'Spacing Between Layers, vertical spacing between adjacent layers when rankdir is TB or BT, and horizontal spacing between adjacent layers when rankdir is LR or RL.',
      },
    ],
    title: 'Dagre Layout',
  },
  {
    type: 'circular',
    options: undefined,
    title: 'Circular Layout',
  },

  {
    type: 'gForce',
    options: undefined,
    title: 'G6 gForce',
  },
  {
    type: 'mds',
    options: undefined,
    title: 'MDS Layout',
  },
  {
    type: 'random',
    options: undefined,
    title: 'Random Layout',
  },
];

export default layouts;
