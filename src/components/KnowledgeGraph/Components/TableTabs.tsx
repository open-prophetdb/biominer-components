import React, { memo } from 'react';
import { Button, Tabs } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';

type TableTabsProps = {
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  nodeTabDisabled?: boolean;
  edgeTabDisabled?: boolean;
};

const TableTabs: React.FC<TableTabsProps> = (props) => {
  const counts = React.Children.count(props.children);
  const childrenArray = React.Children.toArray(props.children);

  const items = [
    {
      label: 'Edges',
      key: 'edges',
      children: counts >= 2 ? childrenArray[1] : 'No Content',
      disabled: props.edgeTabDisabled,
    },
    {
      label: 'Nodes',
      key: 'nodes',
      children: counts >= 2 ? childrenArray[0] : 'No Content',
      disabled: props.nodeTabDisabled,
    },
  ];

  return (
    <Tabs
      className="graph-table"
      items={items}
      tabPosition="right"
      size="small"
      tabBarExtraContent={
        props.onClose ? (
          <Button
            type="text"
            icon={<CloseCircleFilled />}
            onClick={() => {
              props.onClose && props.onClose();
            }}
          />
        ) : null
      }
    />
  );
};

export default memo(TableTabs);
