import { message, Upload, Button, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// @ts-ignore
import Papa from 'papaparse';
import type { UploadProps } from 'antd';
import React, { useEffect, useState } from 'react';
import type { NodeUploaderProps, DataType } from './index.t';
import { flatten, uniqBy } from 'lodash';

const NodeUploader: React.FC<NodeUploaderProps> = (props) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  const fetch = (nodes: { node_id: string; node_type: string }[]) => {
    const groupedNodes = nodes.reduce((acc: any, obj) => {
      const { node_type, node_id } = obj;
      if (acc[node_type]) {
        acc[node_type].push(node_id);
      } else {
        acc[node_type] = [node_id];
      }
      return acc;
    }, {});

    const nodeTypes = Object.keys(groupedNodes);
    console.log('UploadNode fetch: ', groupedNodes, nodeTypes);
    const promises = nodeTypes.map((nodeType) => {
      const nodeIds = groupedNodes[nodeType];
      const query = {
        operator: 'and',
        items: [
          {
            operator: 'in',
            field: 'id',
            value: nodeIds,
          },
          {
            operator: '=',
            field: 'label',
            value: nodeType,
          },
        ],
      };
      return props.getEntities({
        query_str: JSON.stringify(query),
        page: 1,
        // TODO: Whether the page size will be greater than 100?
        page_size: 100,
      });
    });

    return Promise.all(promises);
  };

  useEffect(() => {
    props.onUpload && props.onUpload(dataSource);
  }, [dataSource]);

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    showUploadList: false,
    beforeUpload(file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        // Parse the CSV data using PapaParse
        Papa.parse(reader.result, {
          complete: (result: any) => {
            let data: any = [];
            if (result.data.length >= 100) {
              message.warning(
                'The number of nodes should be less than 100, we will only use the first 100 nodes.',
              );
              data = result.data.slice(0, 100);
            } else {
              data = result.data;
            }

            // Convert the parsed data into an array of objects
            const dataObjects = data.map((row: string[], index: number) => {
              // Assuming the first row of the CSV file contains the headers
              if (index === 0) {
                // Map the headers to the keys of the objects
                return row.map((header) => ({ [header]: null }));
              }

              // Map the values to the corresponding keys in the objects
              return row.reduce((acc: any, val, i) => {
                acc[data[0][i]] = val;
                return acc;
              }, {});
            });

            // Do something with the parsed data
            message.success('Successfully parsed CSV data');

            // Filter out the headers
            const filteredData = dataObjects.filter((obj: DataType) => {
              return obj['node_id'] && obj['node_type'];
            });

            console.log('Parsed CSV data:', dataObjects, filteredData);
            let selectedData: { node_id: string; node_type: string; key: string }[] = [];
            for (const obj of filteredData) {
              selectedData.push({
                key: obj['node_id'],
                node_id: obj['node_id'],
                node_type: obj['node_type'],
              });
            }

            // Deduplicate the selected data
            const uniqueData = uniqBy(selectedData, (obj) => {
              return `${obj.node_id}-${obj.node_type}`;
            });

            notification.info({
              message: 'Found duplicated nodes',
              description: `The number of nodes is ${selectedData.length}, the number of unique nodes is ${uniqueData.length}`,
            });

            console.log('selectedData: ', selectedData, uniqueData);

            // Remap the selected data
            selectedData = uniqueData;
            if (selectedData.length > 0) {
              fetch(selectedData)
                .then((res) => {
                  const matchedData = flatten(
                    res.map((data, index) => {
                      return data.records;
                    }),
                  );

                  const formatedData: DataType[] = selectedData.map((data, index) => {
                    // id may be string or number
                    const matched = matchedData.find((d) => `${d.id}` === data.node_id);
                    if (matched) {
                      return {
                        key: data.node_id,
                        node_id: data.node_id,
                        node_type: data.node_type,
                        matched_id: matched.id,
                        matched_name: matched.name,
                        disabled: false,
                      };
                    } else {
                      return {
                        key: data.node_id,
                        node_id: data.node_id,
                        node_type: data.node_type,
                        matched_id: '',
                        matched_name: '',
                        disabled: true,
                      };
                    }
                  });

                  setDataSource(formatedData);
                })
                .catch((err) => {
                  console.log(err);
                  message.error('Failed to match any nodes with our database.');
                });
            } else {
              message.error('No satisfied data in the uploaded file');
            }
          },
          error: (error: any) => {
            message.error('Failed to parse CSV data');
          },
        });
      };
      reader.onerror = (error) => {
        message.error('Failed to read file');
      };

      // Return false to prevent the upload
      return false;
    },
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default NodeUploader;
