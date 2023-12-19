import React, { memo } from 'react';
import { Button, Tabs } from 'antd';
import { CloseCircleFilled, CloudUploadOutlined } from '@ant-design/icons';

type TableTabsProps = {
  onClose?: () => void;
  onLoadGraph?: () => void;
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
        ) : props.onLoadGraph ? (
          {
            left: (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onLoadGraph && props.onLoadGraph();
                }}
                icon={<CloudUploadOutlined />}
                type="primary"
                style={{ margin: '5px' }}
              >
                Explain
              </Button>
            ),
          }
        ) : null
      }
    />
  );
};

export default memo(TableTabs);
