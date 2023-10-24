import { Form, Select, Empty, InputNumber, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import type { SimilarityNodesSearcherProps } from './index.t';
import { SimilarityNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { fetchNodes } from '../utils';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

const SimilarityNodesSearcher: React.FC<SimilarityNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const entityType = Form.useWatch('entity_type', form);

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
        target_entity_types: props.searchObject.data.target_entity_types,
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
            target_entity_types: values.target_entity_types ? values.target_entity_types : [],
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
      <Form.Item
        label="Node Type"
        name="entity_type"
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
          options={entityOptions}
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
        ></Select>
      </Form.Item>
      <Form.Item
        label="Target Node Type"
        name="target_entity_types"
        rules={[{ required: false, message: 'Please select node type(s).' }]}
      >
        <Select
          mode="multiple"
          allowClear
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          defaultActiveFirstOption={false}
          showArrow={true}
          placeholder={'Please select node type(s)'}
          options={entityTypeOptions}
          filterOption={true}
          onSelect={handleSelectNodeType}
        />
      </Form.Item>
      <Form.Item
        name="topk"
        label="Top K"
        initialValue={50}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={50} />
      </Form.Item>
      <Form.Item label="Merging Mode" name="merge_mode" initialValue={'append'}>
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
