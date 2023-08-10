---
title: SimilarityNodesSearcher
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## SimilarityNodesSearcher

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Tag } from 'antd';
import { SimilarityNodesSearcher } from 'biominer-components';

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
  const [entityTypes, setEntityTypes] = useState([]);

  useEffect(() => {
    getStatistics().then((data) => {
      setEntityTypes(data.entity_stat.map((item) => item.entity_type));
    });
  }, []);

  return (
    <Row style={{ position: 'relative', height: '500px', width: '800px' }}>
      <SimilarityNodesSearcher
        getEntities={(params) => {
          return new Promise((resolve, reject) => {
            axios
              .get('http://localhost:8000/api/v1/entities', {
                params: params,
              })
              .then((response) => {
                resolve(response.data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        }}
        entityTypes={entityTypes}
      ></SimilarityNodesSearcher>
    </Row>
  );
};
```

<API></API>