import React from 'react';
import { Row, Col, Tabs, Empty } from 'antd';
import GraphForm from './GraphForm';
import GraphTable from './GraphTable';
import type { GraphEdge, GraphTableData } from './typings';
import type { KnowledgeGraphEditorProps } from './index.t';
import { TableOutlined, BulbOutlined } from '@ant-design/icons';

import './index.less';

const span = 8;

const KnowledgeGraphEditor: React.FC<KnowledgeGraphEditorProps> = (props) => {
  const [refreshKey, setRefreshKey] = React.useState<number>(0);
  const [formData, setFormData] = React.useState<GraphEdge>({} as GraphEdge);

  const onSubmitKnowledge = (data: GraphEdge): Promise<GraphEdge> => {
    console.log('Submit knowledge: ', data);
    return new Promise((resolve, reject) => {
      if (data.id !== undefined && data.id >= 0) {
        // The backend API requires the id field to be removed
        let id = data.id;
        delete data.id;

        props.putKnowledgeById &&
          props
            .putKnowledgeById(id, data)
            .then((response) => {
              console.log('Put knowledge: ', response);
              setRefreshKey(refreshKey + 1);
              resolve(response);
            })
            .catch((error) => {
              console.log('Put knowledge error: ', error);
              setRefreshKey(refreshKey + 1);
              reject(error);
            });
      } else {
        props.postKnowledge &&
          props
            .postKnowledge(data)
            .then((response) => {
              console.log('Post knowledge: ', response);
              setRefreshKey(refreshKey + 1);
              resolve(response);
            })
            .catch((error) => {
              console.log('Post knowledge error: ', error);
              setRefreshKey(refreshKey + 1);
              reject(error);
            });
      }
    });
  };

  const getKnowledgesData = (page: number, pageSize: number): Promise<GraphTableData> => {
    return new Promise((resolve, reject) => {
      props
        .getKnowledges({
          page: page,
          page_size: pageSize,
        })
        .then((response) => {
          console.log('Get knowledges: ', response);
          resolve({
            data: response.records,
            total: response.total,
            page: page,
            pageSize: pageSize,
          });
        })
        .catch((error) => {
          console.log('Get knowledges error: ', error);
          reject(error);
        });
    });
  };

  const editKnowledge = (record: GraphEdge) => {
    console.log('Edit knowledge: ', record);
    setFormData(record);
  };

  const items = [
    {
      key: 'table-viewer',
      label: (
        <span>
          <TableOutlined />
          Table Viewer
        </span>
      ),
      children: (
        <GraphTable
          key={refreshKey}
          getTableData={getKnowledgesData}
          editKnowledge={editKnowledge}
          deleteKnowledgeById={props.deleteKnowledgeById}
        />
      ),
    },
    {
      key: 'graph-viewer',
      label: (
        <span>
          <BulbOutlined />
          Graph Viewer
        </span>
      ),
      children: <Empty />,
      disabled: true,
    },
  ];

  return (
    <Row gutter={8} className="knowledge-graph-editor">
      <Col xxl={span} xl={span} lg={span} md={24} sm={24} xs={24} className="form">
        <GraphForm
          onSubmit={onSubmitKnowledge}
          formData={formData}
          onClose={() => {
            setFormData({} as GraphEdge);
          }}
          getEntities={props.getEntities}
          getStatistics={props.getStatistics}
        />
      </Col>
      <Col xxl={24 - span} xl={24 - span} lg={24 - span} md={24} sm={24} xs={24} className="table">
        <h3 className="title">History Table</h3>
        <Tabs size="small" defaultActiveKey="table-viewer" items={items} />
      </Col>
    </Row>
  );
};

export default KnowledgeGraphEditor;
