import { Form, Select, InputNumber, Button, Radio } from 'antd';
import React, { useState, useEffect } from 'react';
import type { SharedNodesSearcherProps } from './index.t';
import { SharedNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

const SharedNodesSearcher: React.FC<SharedNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const start_node_option = Form.useWatch('start_node_option', form);
  const nhops = Form.useWatch('nhops', form);
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [start_node_id, setStartNodeId] = useState<string | undefined>(undefined);
  const [hideTopk, setHideTopk] = useState<boolean>(false);
  const [hideNumsSharedBy, setHideNumsSharedBy] = useState<boolean>(false);

  useEffect(() => {
    const entityTypeOptions = props.entityTypes.map((entityType) => ({
      order: 0,
      label: entityType,
      value: entityType,
    }));

    setEntityTypeOptions(sortBy(uniqBy(entityTypeOptions, 'label'), 'label'));
  }, [props.entityTypes]);

  useEffect(() => {
    if (start_node_option === false) {
      setStartNodeId(undefined);
    } else {
      setStartNodeId(props.searchObject?.data.start_node_id);
    }
  }, [start_node_option]);

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

  useEffect(() => {
    if (nhops === 1) {
      if (start_node_option === true) {
        setHideNumsSharedBy(true);
        setHideTopk(true);
        // In simple mode, we only connect the start node to the selected nodes.
        form.setFieldsValue({
          topk: props.searchObject?.data.nodes.length && props.searchObject?.data.nodes.length + 1,
          nums_shared_by: 1,
        });
      } else {
        setHideTopk(true);
        setHideNumsSharedBy(false);
        form.setFieldsValue({
          topk: props.searchObject?.data.nodes.length && props.searchObject?.data.nodes.length + 1,
        });
      }
    } else {
      setHideTopk(false);
      setHideNumsSharedBy(false);
    }
  }, [nhops, start_node_option]);

  const onConfirm = function () {
    form
      .validateFields()
      .then((values) => {
        if (props.onOk) {
          let payload = {
            start_node_id: start_node_id,
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
        label="Start Node?"
        name="start_node_option"
        tooltip="Enable to specify the node you selected as a start node for searching shared nodes with other nodes."
        initialValue={true}
      >
        <Radio.Group>
          <Radio value={true}>Enable</Radio>
          <Radio value={false}>Disable</Radio>
        </Radio.Group>
      </Form.Item>
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
        rules={[
          { required: false, message: 'Please input your expected value', type: 'number' },
          {
            type: 'number',
            min: 1,
            max: 2,
            message: 'The number of hops should be between 1 and 2.',
          },
        ]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        name="topk"
        label="Top K"
        hidden={hideTopk}
        tooltip="The count of nodes to be returned."
        initialValue={10}
        rules={[
          { required: false, message: 'Please input your expected value', type: 'number' },
          {
            type: 'number',
            min: 1,
            max: 50,
            message: 'The number of top k should be between 1 and 50.',
          },
        ]}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        hidden={hideNumsSharedBy}
        name="nums_shared_by"
        label="Number of Shared By"
        tooltip="The count of specified nodes connected to each found node, highlighting shared relationships."
        initialValue={props.searchObject?.data.nodes.length}
        rules={[
          { required: false, message: 'Please input your expected value', type: 'number' },
          {
            type: 'number',
            min: 1,
            max: props.searchObject?.data.nodes.length || 2,
            message: 'The number of shared by should be between 1 and the number of nodes.',
          },
        ]}
      >
        <InputNumber />
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
