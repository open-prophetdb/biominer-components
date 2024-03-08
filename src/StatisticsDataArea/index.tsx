import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { StatisticsDataAreaProps } from './index.t';
import type { DataItem } from '../DataArea/index.t';
import DataArea from '../DataArea';

const StatisticsDataArea: React.FC<StatisticsDataAreaProps> = (props) => {
  const [statisticsData, setStatisticsData] = useState<DataItem[]>([]);

  const DirtyStatus = (status: boolean, currentGraphUUID: string) => {
    return (
      <span>
        {status ? <Tag color="#f50">dirty</Tag> : <Tag color="#87d068">cleaned</Tag>}
        &nbsp;
        {currentGraphUUID}
      </span>
    );
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  useEffect(() => {
    setStatisticsData([
      [
        <span>
          Nodes <Tag color="#2db7f5">Canvas</Tag>
        </span>,
        formatNumber(props.data.numNodes || 0),
      ],
      [
        <span>
          Edges <Tag color="#2db7f5">Canvas</Tag>
        </span>,
        formatNumber(props.data.numEdges || 0),
      ],
      [
        <span>
          Nodes <Tag color="#108ee9">KGraph</Tag>
        </span>,
        formatNumber(props.data.numAllNodes || 0),
      ],
      [
        <span>
          Edges <Tag color="#108ee9">KGraph</Tag>
        </span>,
        formatNumber(props.data.numAllEdges || 0),
      ],
      [
        <span>
          Status <Tag color="#2db7f5">Canvas</Tag>
        </span>,
        DirtyStatus(props.data.isDirty, props.data.currentParentUUID || ''),
      ],
    ]);
  }, [props]);

  return statisticsData ? <DataArea data={statisticsData} style={props.style} /> : null;
};

export default StatisticsDataArea;
