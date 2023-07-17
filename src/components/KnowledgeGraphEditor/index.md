---
title: KnowledgeGraphEditor
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## KnowledgeGraphEditor

```tsx
import React from 'react';
import axios from 'axios';
import { KnowledgeGraphEditor } from 'biominer-components';

const getEntities = (params) => {
  console.log('Get entities', params);
  return new Promise((resolve, reject) => {
    axios
      .get('http://localhost:8000/api/v1/entities', { params: params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

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

const getKnowledges = (params) => {
  return new Promise((resolve, reject) => {
    axios
      .get('http://localhost:8000/api/v1/curated-knowledges', { params: params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const postKnowledge = (payload) => {
  return new Promise((resolve, reject) => {
    axios
      .post('http://localhost:8000/api/v1/curated-knowledges', payload)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const putKnowledgeById = (id, payload) => {
  return new Promise((resolve, reject) => {
    axios
      .put(`http://localhost:8000/api/v1/curated-knowledges/${id}`, payload)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const deleteKnowledgeById = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`http://localhost:8000/api/v1/curated-knowledges/${id}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => (
  <KnowledgeGraphEditor
    getKnowledges={getKnowledges}
    getStatistics={getStatistics}
    getEntities={getEntities}
    postKnowledge={postKnowledge}
    putKnowledgeById={putKnowledgeById}
    deleteKnowledgeById={deleteKnowledgeById}
  />
);
```

<API></API>
