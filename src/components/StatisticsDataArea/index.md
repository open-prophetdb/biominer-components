---
title: StatisticsDataArea
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## StatisticsDataArea

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Tag } from 'antd';
import { StatisticsDataArea } from 'biominer-components';
import { stat_total_node_count, stat_total_relation_count } from '../StatisticsChart/utils';

const getStatistics = () => {
  return new Promise((resolve, reject) => {
    axios
      .get('http://localhost:8000/api/v1/statistics')
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    getStatistics().then((data) => {
      setStatistics({
        numNodes: 0,
        numEdges: 0,
        numAllNodes: stat_total_node_count(data.entity_stat),
        numAllEdges: stat_total_relation_count(data.relation_stat),
        isDirty: false,
        currentGraphUUID: 'Not Specified',
      });
    });
  }, []);

  return (
    <Row style={{ position: 'relative', height: '200px' }}>
      <StatisticsDataArea
        data={statistics}
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          zIndex: 1,
        }}
      ></StatisticsDataArea>
    </Row>
  );
};
```

<API></API>
