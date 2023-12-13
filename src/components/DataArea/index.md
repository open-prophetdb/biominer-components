---
title: DataArea
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## DataArea

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../../request';
import { Row, Tag } from 'antd';
import { DataArea } from 'biominer-components';
import { stat_total_node_count, stat_total_relation_count } from '../StatisticsChart/utils';

const getStatistics = () => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/statistics')
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => {
  const [statistics, setStatistics] = useState([]);

  const DirtyStatus = (status: boolean, currentGraphUUID: string) => {
    return (
      <span>
        {status ? <Tag color="#f50">dirty</Tag> : <Tag color="#87d068">cleaned</Tag>}
        &nbsp;
        {currentGraphUUID}
      </span>
    );
  };

  useEffect(() => {
    getStatistics().then((data) => {
      setStatistics([
        [
          <span>
            Nodes <Tag color="#2db7f5">Canvas</Tag>
          </span>,
          0,
        ],
        [
          <span>
            Edges <Tag color="#2db7f5">Canvas</Tag>
          </span>,
          0,
        ],
        [
          <span>
            Nodes <Tag color="#108ee9">KGraph</Tag>
          </span>,
          stat_total_node_count(data.entity_stat),
        ],
        [
          <span>
            Edges <Tag color="#108ee9">KGraph</Tag>
          </span>,
          stat_total_relation_count(data.relation_stat),
        ],
        [
          <span>
            Status <Tag color="#2db7f5">Canvas</Tag>
          </span>,
          DirtyStatus(true, '1234567890'),
        ],
      ]);
    });
  }, []);

  return (
    <Row style={{ position: 'relative', height: '200px' }}>
      <DataArea
        data={statistics}
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          zIndex: 1,
        }}
      ></DataArea>
    </Row>
  );
};
```

<API></API>
