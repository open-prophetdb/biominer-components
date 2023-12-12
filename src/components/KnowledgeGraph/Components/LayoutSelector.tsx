import * as React from 'react';
import { Row, Col, Divider, Dropdown, Menu, Card, Space, message } from 'antd';
import {
  DownOutlined,
  TrademarkCircleFilled,
  ChromeFilled,
  BranchesOutlined,
  ApartmentOutlined,
  AppstoreFilled,
  CopyrightCircleFilled,
  ShareAltOutlined,
  ForkOutlined,
  RadarChartOutlined,
  MailOutlined,
  AimOutlined,
} from '@ant-design/icons';
import LayoutOptionsPanel from './LayoutOptionsPanel';
import { Layouts } from './LayoutNetworks';
import './LayoutSelector.less';

const iconMapByType: { [key: string]: React.ReactNode } = {
  preset: <AimOutlined />,
  'graphin-force': <ShareAltOutlined />,
  random: <TrademarkCircleFilled />,
  concentric: <ChromeFilled />,
  circular: <BranchesOutlined />,
  force: <AppstoreFilled />,
  dagre: <ApartmentOutlined />,
  grid: <CopyrightCircleFilled />,
  radial: <RadarChartOutlined />,
  gForce: <ForkOutlined />,
  mds: <MailOutlined />,
};

const LayoutAlgorithmDescriptions: { [key: string]: string } = {
  preset:
    'This algorithm arranges nodes in a preset layout, useful for visualizing small graphs with a known structure.',
  'graphin-force':
    'This layout algorithm uses a force-directed approach to arrange nodes in a graph, allowing them to naturally repel and attract each other for an optimized layout.',
  random:
    'This algorithm arranges nodes in a graph randomly, resulting in an unpredictable and chaotic arrangement.',
  concentric:
    'Nodes are organized into concentric circles or rings, with nodes of higher importance placed closer to the center.',
  circular:
    'Nodes are arranged in a circular pattern, often with a central node and radiating outward, providing a clear visual hierarchy.',
  force:
    "Similar to 'graphin-force,' this algorithm utilizes a force- directed approach to position nodes, ensuring an organized and visually pleasing graph layout.",
  dagre:
    'This algorithm applies the Directed Acyclic Graph(DAG) layout, useful for arranging nodes in hierarchical structures with no cycles, such as trees.',
  grid: 'Nodes are placed in a grid or matrix - like pattern, creating an organized and easily navigable structure.',
  radial:
    'This layout arranges nodes in a circular or radial form, commonly used for visualizing hierarchical structures or tree diagrams.',
  gForce:
    "An alternative force - directed layout approach, similar to 'graphin-force,' for achieving well - organized graph layouts.",
  mds: 'This algorithm employs multidimensional scaling techniques to position nodes based on their pairwise distances, often used for visualizing high - dimensional data in lower dimensions.',
};

interface LayoutSelectorProps {
  style?: React.CSSProperties;
  /** 布局类型 */
  type: string;

  /** 布局切换的回调函数 */
  onChange: ({ type, options }: { type?: string; options?: unknown }) => void;

  /** 所有布局信息 */
  layouts: Layouts;
}

// @ts-ignore
const LayoutMenu = ({ handleChange, description, layouts }) => {
  const [visible, setVisible] = React.useState(false);
  const handleVisibleChange = (flag: any) => {
    setVisible(flag);
  };

  const handleChangeLayoutType = (e: any) => {
    handleChange(e.key);
    setVisible(false);
  };

  const menu = (
    <Menu onClick={handleChangeLayoutType}>
      {layouts.map((item: any) => {
        const { type, title } = item;
        return (
          <Menu.Item key={type}>
            <Row style={{ display: 'flex', flexDirection: 'column', maxWidth: '240px' }}>
              <Col>
                {iconMapByType[type]} {title}
              </Col>
              <Col>
                <small>{LayoutAlgorithmDescriptions[type]}</small>
              </Col>
            </Row>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      onOpenChange={handleVisibleChange}
      open={visible}
      trigger={['click']}
      getPopupContainer={(triggerNode) => {
        // @ts-ignore
        return triggerNode || document.body;
      }}
      overlayStyle={{ height: '300px', overflow: 'scroll' }}
    >
      <Row style={{ paddingTop: '15px' }}>
        <Col span={8}>Layout Type</Col>
        <Col span={16}> {description}</Col>
      </Row>
    </Dropdown>
  );
};

const LayoutSelector: React.FunctionComponent<LayoutSelectorProps> = (props) => {
  const { style, type, onChange, layouts } = props;
  const matchLayout = layouts.find((item) => item.type === type);
  if (!matchLayout) {
    message.error(`Can't find layout by type ${type}`);
    return null;
  }

  const matchOptions = matchLayout.options;

  const { title } = matchLayout;
  const handleChange = (selectedType: string, options?: {}) => {
    console.log(selectedType);
    if (onChange) {
      onChange({ type: selectedType, options });
    }
  };

  const description = (
    <Space>
      {iconMapByType[type]} {title} <DownOutlined />
    </Space>
  );

  return (
    <Card title={null} bordered={false} style={{ ...style }} className="layout-settings-panel">
      <LayoutMenu handleChange={handleChange} description={description} layouts={layouts} />
      <Divider style={{ margin: '15px 0px' }} />
      <div style={{ height: '260px', overflow: 'scroll' }}>
        <LayoutOptionsPanel
          options={matchOptions}
          type={type}
          key={type}
          handleChange={handleChange}
        />
      </div>
    </Card>
  );
};

export default LayoutSelector;
