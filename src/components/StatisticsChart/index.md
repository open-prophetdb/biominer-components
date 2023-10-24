---
title: StatisticsChart
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## StatisticsChart

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../../request';
import { StatisticsChart } from 'biominer-components';

const getStatistics = () => {
  return new Promise((resolve, reject) => {
    request
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
  const [nodeStat, setNodeStat] = useState([]);
  const [edgeStat, setEdgeStat] = useState([]);

  useEffect(() => {
    getStatistics().then((data) => {
      setNodeStat(data.entity_stat);
      setEdgeStat(data.relation_stat);
    });
  }, []);

  return <StatisticsChart nodeStat={nodeStat} edgeStat={edgeStat} />;
};
```

<API></API>
