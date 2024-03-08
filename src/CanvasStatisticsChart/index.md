---
title: CanvasStatisticsChart
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## CanvasStatisticsChart

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../request';
import { message } from 'antd';
import { CanvasStatisticsChart } from 'biominer-components';

const entityIds = [
  'DrugBank:DB00911',
  'UMLS:C0231528',
  'ENTREZ:740',
  'ENTREZ:6183',
  'UBERON:0002369',
  'ENTREZ:85403',
  'UBERON:0002367',
  'ENTREZ:56342',
  'DrugBank:DB00898',
  'ENTREZ:56632',
  'DrugBank:DB00508',
];

const entityTypes = [
  'Compound',
  'SideEffect',
  'Gene',
  'Gene',
  'Anatomy',
  'Gene',
  'Anatomy',
  'Gene',
  'Compound',
  'Gene',
  'Compound',
];

const nodeIds = entityIds.map((id, index) => {
  return `${entityTypes[index]}::${id}`;
});

const getNodes = () => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/nodes', {
        params: {
          node_ids: nodeIds.join(','),
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => {
  const [data, setData] = useState({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    getNodes().then((data) => {
      console.log('Get nodes data: ', data);
      setData(data);
    });
  }, []);

  return <CanvasStatisticsChart data={data} />;
};
```

<API></API>
