---
title: KnowledgeGraph
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## KnowledgeGraph

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../request';
import { Row, Tag } from 'antd';
import { KnowledgeGraph } from 'biominer-components';
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

const getEntities = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/entities', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getRelations = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/relations', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getRelationCounts = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/relation-counts', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getGraphHistory = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/subgraphs', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const postGraphHistory = (data) => {
  return new Promise((resolve, reject) => {
    request
      .post('/api/v1/subgraphs', data)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const deleteGraphHistoryById = ({ id }) => {
  return new Promise((resolve, reject) => {
    request
      .delete(`/api/v1/subgraphs/${id}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getNodes = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/nodes', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getSimilarityNodes = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/similarity-nodes', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getOneStepLinkedNodes = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/one-step-linked-nodes', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getConnectedNodes = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/auto-connect-nodes', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getEntity2D = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/entity2d', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getEntityColorMap = () => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/entity-colormap')
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchPaths = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/paths', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchSharedNodes = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/shared-nodes', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchPrompts = (params) => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/llm-prompts', { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => {
  return (
    <Row style={{ position: 'relative', width: '900px' }}>
      <KnowledgeGraph
        apis={{
          GetStatisticsFn: getStatistics,
          GetEntitiesFn: getEntities,
          GetRelationsFn: getRelations,
          GetRelationCountsFn: getRelationCounts,
          GetGraphHistoryFn: getGraphHistory,
          PostGraphHistoryFn: postGraphHistory,
          DeleteGraphHistoryFn: deleteGraphHistoryById,
          GetNodesFn: getNodes,
          GetPredictedNodesFn: getSimilarityNodes,
          GetOneStepLinkedNodesFn: getOneStepLinkedNodes,
          GetConnectedNodesFn: getConnectedNodes,
          GetEntity2DFn: getEntity2D,
          GetNStepsLinkedNodesFn: fetchPaths,
          GetEntityColorMapFn: getEntityColorMap,
          GetSharedNodesFn: fetchSharedNodes,
          GetPromptsFn: fetchPrompts,
        }}
      />
    </Row>
  );
};
```

<API></API>
