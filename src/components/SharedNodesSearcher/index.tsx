import { Form, Select, InputNumber, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import type { SharedNodesSearcherProps } from './index.t';
import { SharedNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

const SharedNodesSearcher: React.FC<SharedNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);

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
      props.searchObject.get_instance_id() === `shared-nodes-search-object`
    ) {
      form.setFieldsValue({
        node_types: props.searchObject.data.node_types,
        nhops: props.searchObject.data.nhops,
        topk: props.searchObject.data.topk,
        nums_shared_by: props.searchObject.data.nums_shared_by,
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
            nodes: props.searchObject?.data.nodes || [],
            node_types: values.node_types,
            topk: values.topk,
            nhops: values.nhops,
            nums_shared_by: values.nums_shared_by,
          };

          props.onOk(new SharedNodesSearchObjectClass(payload, values.merge_mode));
        }
      })
      .catch((error) => {
        console.log('onConfirm Error: ', error);
      });
  };

  return (
    <Form
      className="shared-nodes-searcher"
      layout={'horizontal'}
      form={form}
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
    >
      <Form.Item
        label="Node Type(s)"
        name="node_types"
        tooltip="The type of nodes to be searched. If not specified, all types of nodes will be searched."
        rules={[{ required: false, message: 'Please select node type(s).' }]}
      >
        <Select
          allowClear
          mode="multiple"
          defaultActiveFirstOption={false}
          showArrow={true}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          placeholder={'Please select node type(s)'}
          options={entityTypeOptions}
          filterOption={true}
        />
      </Form.Item>
      <Form.Item
        name="nhops"
        label="Number of Hops"
        tooltip="The depth of the search. The maximum number of hops to be searched. For performance reasons, we limit the maximum number of hops to 2."
        initialValue={1}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={2} />
      </Form.Item>
      <Form.Item
        name="topk"
        label="Top K"
        tooltip="The count of nodes to be returned."
        initialValue={10}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={50} />
      </Form.Item>
      <Form.Item
        name="nums_shared_by"
        label="Number of Shared By"
        tooltip="The count of specified nodes connected to each found node, highlighting shared relationships."
        initialValue={props.searchObject?.data.nodes.length}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={props.searchObject?.data.nodes.length || 2} />
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

export default SharedNodesSearcher;
