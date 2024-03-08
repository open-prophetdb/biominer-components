import React from 'react';
import { Descriptions } from 'antd';
import { DataAreaProps } from './index.t';

const DataArea: React.FC<DataAreaProps> = (props) => {
  const { data, style } = props;
  const items = data.map((item, index) => {
    return (
      <Descriptions.Item key={index} label={item[0]}>
        {item[1]}
      </Descriptions.Item>
    );
  });
  return items.length > 0 ? (
    <Descriptions
      size={'small'}
      column={2}
      title={null}
      labelStyle={{ backgroundColor: 'transparent' }}
      bordered
      style={{ ...style }}
    >
      {items}
    </Descriptions>
  ) : (
    <span style={style}>No Properties</span>
  );
};

export default DataArea;
