import { Form, Select, Empty, Popover, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import type { BatchNodesSearcherProps } from './index.t';
import { BatchNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { fetchNodes, formatNodeIds, parseNodeIds, formatNodeId } from '../utils';
import { sortBy, uniqBy } from 'lodash';
import EntityCard from '../EntityCard';

import './index.less';

const BatchNodesSearcher: React.FC<BatchNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const entityType = Form.useWatch('entity_type', form);

  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [placeholder, setPlaceholder] = useState<string>('Search nodes ...');
  const [entityOptions, setEntityOptions] = useState<OptionType[] | undefined>(undefined);
  const [nodeIdsOptions, setNodeIdsOptions] = useState<OptionType[] | undefined>(undefined);

  const handleSelectNodeType = function (value: string) {
    setEntityOptions(undefined);
    setPlaceholder(`Search ${value} nodes ...`);
  };

  const handleSearchNode = function (entityType: string, value: string) {
    if (value) {
      setLoading(true);
      fetchNodes(props.getEntities, entityType, value, (options: OptionType[]) => {
        setEntityOptions(options);
        setLoading(false);
      });
    } else {
      setEntityOptions(undefined);
    }
  };

  const addToNodeIdsOptions = function (
    value: string,
    option: { key: string; value: any; children: any },
  ) {
    console.log('addToNodeIdsOptions', value, option);
    if (value) {
      setNodeIdsOptions((nodeIdsOptions) => {
        let newOptions = nodeIdsOptions ? [...nodeIdsOptions] : [];
        let nodeId = formatNodeId(value, entityType);
        const label = option.key;
        newOptions.push({
          label: label || nodeId,
          value: nodeId,
          order: 0,
        });
        return uniqBy(newOptions, 'label');
      });
    }
  };

  useEffect(() => {
    const entityTypeOptions = props.entityTypes.map((entityType) => ({
      order: 0,
      label: entityType,
      value: entityType,
    }));

    setEntityTypeOptions(sortBy(uniqBy(entityTypeOptions, 'label'), 'label'));
  }, [props.entityTypes]);

  useEffect(() => {
    if (
      props.searchObject &&
      props.searchObject.get_instance_id() === `similarity-nodes-search-object`
    ) {
      form.setFieldsValue({
        nodeIds: formatNodeIds(
          props.searchObject.data.entity_ids,
          props.searchObject.data.entity_types,
        ),
      });
    }
  }, [props.searchObject]);

  const clearNodeIdType = (value: string) => {
    form.setFieldsValue({ entity_type: undefined, entity_id: undefined });
  };

  const onConfirm = () => {
    form
      .validateFields()
      .then((values) => {
        if (props.onOk) {
          const { entityIds, entityTypes } = parseNodeIds(values.nodeIds);
          let payload = {
            entity_types: entityTypes,
            entity_ids: entityIds,
          };

          props.onOk(new BatchNodesSearchObjectClass(payload, values.merge_mode));
        }
      })
      .catch((error) => {
        console.log('onConfirm Error: ', error);
      });
  };

  return (
    <Form
      className="batch-nodes-searcher"
      layout={'horizontal'}
      form={form}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
    >
      <Form.Item
        label="Node Type"
        name="entity_type"
        rules={[{ required: false, message: 'Please select a node type.' }]}
      >
        <Select
          allowClear
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          defaultActiveFirstOption={false}
          showArrow={true}
          placeholder={'Please select a node type'}
          options={entityTypeOptions}
          filterOption={true}
          onSelect={handleSelectNodeType}
        />
      </Form.Item>
      <Form.Item
        label="Which Node"
        name="entity_id"
        rules={[
          {
            required: false,
            message: 'Please enter your expected node.',
          },
        ]}
      >
        <Select
          showSearch
          allowClear
          loading={loading}
          defaultActiveFirstOption={false}
          showArrow={true}
          placeholder={placeholder}
          onSearch={(value) => handleSearchNode(entityType, value)}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          filterOption={false}
          onSelect={addToNodeIdsOptions}
          notFoundContent={
            <Empty
              description={
                loading
                  ? 'Searching...'
                  : entityOptions !== undefined
                  ? 'Not Found or Too Short Input'
                  : entityType === undefined
                  ? 'Please select a node type first.'
                  : `Enter your interested ${entityType} ...`
              }
            />
          }
        >
          {entityOptions &&
            entityOptions.map((option: any) => (
              <Select.Option key={option.label} value={option.value} disabled={option.disabled}>
                {option.metadata ? (
                  <Popover
                    placement="rightBottom"
                    title={option.label}
                    content={EntityCard(option.metadata)}
                    trigger="hover"
                    getPopupContainer={(triggeredNode: any) => document.body}
                    overlayClassName="entity-id-popover"
                    autoAdjustOverflow={false}
                    showArrow={true}
                    destroyTooltipOnHide={true}
                    zIndex={1500}
                  >
                    {option.label}
                  </Popover>
                ) : (
                  option.label
                )}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Node Ids"
        name="nodeIds"
        tooltip="Please select node id and node type from the above form first, and then select the composed node id. If you want to load a lot of nodes, please use the batch query form."
        rules={[
          {
            required: true,
            message: 'Please select node id and node type from the above form.',
          },
        ]}
      >
        <Select
          mode="multiple"
          allowClear
          defaultActiveFirstOption={false}
          showArrow={true}
          onSelect={clearNodeIdType}
          placeholder={'Please select composed node id'}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          filterOption={true}
        >
          {nodeIdsOptions &&
            nodeIdsOptions.map((option: any) => (
              <Select.Option key={option.label} value={option.value} disabled={option.disabled}>
                {option.metadata ? (
                  <Popover
                    placement="rightBottom"
                    title={option.label}
                    content={EntityCard(option.metadata)}
                    trigger="hover"
                    getPopupContainer={(triggeredNode: any) => document.body}
                    overlayClassName="entity-id-popover"
                    autoAdjustOverflow={false}
                    showArrow={true}
                    destroyTooltipOnHide={true}
                    zIndex={1500}
                  >
                    {option.label}
                  </Popover>
                ) : (
                  option.label
                )}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item label="Merging Mode" name="merge_mode" initialValue={'append'}>
        <Select
          placeholder="Please select mode for merging nodes & relationships"
          options={MergeModeOptions}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
        ></Select>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 18, span: 6 }}>
        <Button
          style={{ marginRight: '10px' }}
          onClick={() => {
            form.resetFields();
          }}
        >
          Reset
        </Button>
        <Button type="primary" onClick={onConfirm}>
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BatchNodesSearcher;
