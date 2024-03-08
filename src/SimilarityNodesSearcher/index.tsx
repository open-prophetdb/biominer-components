import { Form, Select, Empty, InputNumber, Button, Popover } from 'antd';
import React, { useState, useEffect } from 'react';
import type { SimilarityNodesSearcherProps } from './index.t';
import { SimilarityNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { fetchNodes, makeRelationTypes } from '../utils';
import { sortBy, uniqBy } from 'lodash';
import EntityCard from '../EntityCard';

import './index.less';

const SimilarityNodesSearcher: React.FC<SimilarityNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const entityType = Form.useWatch('entity_type', form);

  const relationTypeOptions = makeRelationTypes(props.relationStat);
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [placeholder, setPlaceholder] = useState<string>('Search nodes ...');
  const [entityOptions, setEntityOptions] = useState<OptionType[] | undefined>(undefined);

  const handleSelectNodeType = function (value: string) {
    setEntityOptions(undefined);
    setPlaceholder(`Search ${value} nodes ...`);
  };

  const handleSearchNode = function (entityType: string, value: string) {
    if (value) {
      setLoading(true);
      fetchNodes(props.getEntities, entityType, value, (options) => {
        setEntityOptions(options);
        setLoading(false);
      });
    } else {
      setEntityOptions(undefined);
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
        entity_type: props.searchObject.data.entity_type,
        entity_id: props.searchObject.data.entity_id,
        relation_type: props.searchObject.data.relation_type,
        topk: props.searchObject.data.topk,
        merge_mode: props.searchObject.merge_mode,
      });
    }
  }, [props.searchObject]);

  const onConfirm = function () {
    form
      .validateFields()
      .then((values) => {
        if (props.onOk) {
          let payload = {
            entity_type: values.entity_type,
            entity_id: values.entity_id,
            relation_type: values.relation_type,
            topk: values.topk ? values.topk : 50,
          };

          props.onOk(new SimilarityNodesSearchObjectClass(payload, values.merge_mode));
        }
      })
      .catch((error) => {
        console.log('onConfirm Error: ', error);
      });
  };

  return (
    <Form
      className="similarity-nodes-searcher"
      layout={'horizontal'}
      form={form}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
    >
      <p style={{ marginTop: '0' }}>
        NOTE: This is a similarity search for nodes according to our model, such as finding similar
        drugs with a specific drug. If you are interested in finding similar nodes to a specific
        node, please select the node type and node id, and then select the relation type and top k
        similar nodes.
      </p>
      <Form.Item
        label="Node Type"
        name="entity_type"
        tooltip="The type of the node you are interested in. Such as Disease, Gene, Compound, etc. You need to select a node type first, then you can search the node by its name or id."
        rules={[{ required: true, message: 'Please select a node type.' }]}
      >
        <Select
          allowClear
          defaultActiveFirstOption={false}
          showArrow={true}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          placeholder={'Please select a node type'}
          options={entityTypeOptions}
          filterOption={true}
          onSelect={handleSelectNodeType}
        />
      </Form.Item>
      <Form.Item
        label="Which Node"
        name="entity_id"
        tooltip="The node you are interested in. You can search the node by its name or id. You need to select a node type first."
        rules={[
          {
            required: true,
            message: 'Please enter your expected node.',
          },
        ]}
      >
        <Select
          showSearch
          allowClear
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          loading={loading}
          defaultActiveFirstOption={false}
          showArrow={true}
          placeholder={placeholder}
          onSearch={(value) => handleSearchNode(entityType, value)}
          filterOption={false}
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
        label="Relation Type"
        name="relation_type"
        tooltip="The relation types between the selected node and other nodes. We will rank the relations according to our model's score. so the top relations are more likely to be the most similar ones."
        rules={[{ required: true, message: 'Please select a relation type' }]}
      >
        <Select
          filterOption={(input, option) => {
            // @ts-ignore
            return option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          allowClear
          autoClearSearchValue={false}
          placeholder="Please select relation types"
        >
          {relationTypeOptions.map((item: OptionType) => {
            return (
              <Select.Option key={item.value} value={item.value}>
                <div className="option-container">
                  <div className="option-label">{item.label}</div>
                  <div className="option-description">{item.description}</div>
                </div>
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        name="topk"
        label="Top K"
        tooltip="The number of similar nodes you want to get. The default value is 50."
        initialValue={50}
        rules={[
          { required: false, message: 'Please input your expected value', type: 'number' },
          { type: 'number', min: 1, max: 50, message: 'The value should be between 1 and 50' },
        ]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        label="Merging Mode"
        name="merge_mode"
        initialValue={'append'}
        tooltip="The mode for merging nodes and relationships. If append, we will append the new nodes and relationships to the existing graph. If replace, we will replace the existing graph with the new nodes and relationships..."
      >
        <Select
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          placeholder="Please select mode for merging nodes & relationships"
          options={MergeModeOptions}
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

export default SimilarityNodesSearcher;
