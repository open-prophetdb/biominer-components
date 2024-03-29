import React, { useEffect, useState } from 'react';
import { Table, Row, Tag, Space, message, Popover, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { GraphEdge, GraphTableData, DeleteKnowledgeByIdFn } from './index.t';

import './GraphTable.less';

const exampleData: GraphEdge[] = [
  {
    source_name: 'John Brown',
    source_id: '32',
    source_type: 'New York No. 1 Lake Park',
    target_name: 'John Brown',
    target_id: '32',
    target_type: 'New York No. 1 Lake Park',
    relation_type: 'relation_type',
    key_sentence: 'key_sentence',
    pmid: 123456,
  },
];

type GraphTableProps = {
  getTableData: (page: number, pageSize: number) => Promise<GraphTableData>;
  editKnowledge?: (record: GraphEdge) => void;
  page?: number;
  pageSize?: number;
  deleteKnowledgeById?: DeleteKnowledgeByIdFn;
  pageSizeOptions?: string[];
  className?: string;
  style?: React.CSSProperties;
  yScroll?: number | string;
  xScroll?: number | string;
};

const GraphTable: React.FC<GraphTableProps> = (props) => {
  const [data, setData] = useState<GraphTableData>({} as GraphTableData);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(props.page || 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize || 30);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const columns: ColumnsType<GraphEdge> = [
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      fixed: 'left',
      width: 120,
      render: (text, record) => {
        return (
          <Space>
            <div>
              <Button
                size="small"
                disabled={props.editKnowledge ? false : true}
                onClick={() => {
                  editKnowledge(record);
                }}
              >
                Edit
              </Button>
            </div>
            <div>
              <Popover
                content={
                  <div>
                    <p style={{ marginBottom: '5px' }}>Are you sure to delete this knowledge?</p>
                    <p style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0' }}>
                      <Button
                        danger
                        size="small"
                        onClick={() => {
                          if (
                            record.id !== undefined &&
                            record.id >= 0 &&
                            props.deleteKnowledgeById
                          ) {
                            props
                              .deleteKnowledgeById(record.id)
                              .then((response: any) => {
                                message.success('Delete knowledge successfully!');
                                setRefreshKey(refreshKey + 1);
                              })
                              .catch((error: any) => {
                                console.log('Delete knowledge error: ', error);
                                message.error('Delete knowledge failed!');
                              });
                          } else {
                            message.error('Delete knowledge failed!');
                            console.log(
                              'Delete knowledge error: ',
                              record,
                              props.deleteKnowledgeById,
                            );
                          }
                        }}
                      >
                        Confirm
                      </Button>
                    </p>
                  </div>
                }
                title="Comfirm"
              >
                <Button danger size="small" disabled={props.deleteKnowledgeById ? false : true}>
                  Delete
                </Button>
              </Popover>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Relation Type',
      key: 'relation_type',
      align: 'center',
      dataIndex: 'relation_type',
      fixed: 'left',
      width: 240,
    },
    {
      title: 'PMID',
      dataIndex: 'pmid',
      align: 'center',
      key: 'pmid',
      render: (text) => {
        return (
          <a target="_blank" href={`https://pubmed.ncbi.nlm.nih.gov/?term=${text}`}>
            {text}
          </a>
        );
      },
      fixed: 'left',
      width: 100,
    },
    {
      title: 'Source Name',
      dataIndex: 'source_name',
      key: 'source_name',
      align: 'center',
      width: 200,
    },
    {
      title: 'Source ID',
      dataIndex: 'source_id',
      align: 'center',
      key: 'source_id',
      width: 150,
    },
    {
      title: 'Source Type',
      dataIndex: 'source_type',
      align: 'center',
      key: 'source_type',
      width: 100,
    },
    {
      title: 'Target Name',
      dataIndex: 'target_name',
      align: 'center',
      key: 'target_name',
      width: 200,
    },
    {
      title: 'Target ID',
      dataIndex: 'target_id',
      align: 'center',
      key: 'target_id',
      width: 150,
    },
    {
      title: 'Target Type',
      dataIndex: 'target_type',
      align: 'center',
      key: 'target_type',
      width: 100,
    },
    {
      title: 'Created Time',
      key: 'created_at',
      align: 'center',
      dataIndex: 'created_at',
      render: (text) => {
        return new Date(text).toLocaleString();
      },
      width: 200,
    },
  ];

  const editKnowledge = (record: GraphEdge) => {
    if (props.editKnowledge) {
      props.editKnowledge(record);
    }
  };

  useEffect(() => {
    setLoading(true);
    props
      .getTableData(page, pageSize)
      .then((response) => {
        setData(response);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Get knowledges error: ', error);
        setData({} as GraphTableData);
        setLoading(false);
      });
  }, [page, pageSize, refreshKey]);

  const getRowKey = (record: GraphEdge) => {
    // return `${record.source_id}-${record.target_id}-${record.relation_type}-${record.pmid}-${record.curator}`;
    return record.id || `${JSON.stringify(record)}`;
  };

  return (
    <Row className="graph-table-container">
      <Table
        className={props.className + ' graph-table'}
        style={props.style}
        size="small"
        columns={columns}
        loading={loading}
        scroll={{ x: props.xScroll || 1000, y: props.yScroll || 'calc(100vh - 240px)' }}
        dataSource={data.data}
        rowKey={(record) => getRowKey(record)}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <Tag>Key Sentence</Tag> {record.key_sentence || 'No Key Sentence'}
              <br />
              <Tag>Curator</Tag> {record.curator || 'Unknown'}
            </p>
          ),
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: props.pageSizeOptions || ['10', '20', '50', '100', '300', '500', '1000'],
          current: page,
          pageSize: pageSize,
          total: data.total || 0,
          position: ['bottomRight'],
          showTotal: (total) => {
            return `Total ${total} items`;
          },
        }}
        onChange={(pagination) => {
          setPage(pagination.current || 1);
          setPageSize(pagination.pageSize || 10);
        }}
      ></Table>
    </Row>
  );
};

export default GraphTable;
