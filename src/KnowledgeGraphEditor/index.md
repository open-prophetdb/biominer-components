## KnowledgeGraphEditor

```tsx
import React from 'react';
import { request } from '../request';
import { KnowledgeGraphEditor } from 'biominer-components';

const getEntities = (params) => {
  console.log('Get entities', params);
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/entities', { params: params })
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

const getKnowledges = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/curated-knowledges', { params: params })
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
    request
      .post('/api/v1/curated-knowledges', payload)
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
    request
      .put(`/api/v1/curated-knowledges/${id}`, payload)
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
    request
      .delete(`/api/v1/curated-knowledges/${id}`)
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
