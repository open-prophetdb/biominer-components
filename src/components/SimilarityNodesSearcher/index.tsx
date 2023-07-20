import { Form, Select, Empty, InputNumber, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import type { SimilarityNodesSearcherProps } from './index.t';
import { SimilarityNodesSearchObjectClass } from './index.t';
import { type OptionType, MergeModeOptions } from '../typings';
import { makeQueryEntityStr } from '../KnowledgeGraphEditor/utils';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

let timeout: ReturnType<typeof setTimeout> | null;

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

  // This function is used to fetch the entities of the selected entity type.
  // All the nodes will be added to the options as a dropdown list.
  const fetchNodes = async (entityType: string, value: string, callback: (any: any) => void) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    const fetchData = () => {
      setLoading(true);
      props
        .getEntities({
          query_str: makeQueryEntityStr({ id: value, name: value, label: entityType }),
          page: 1,
          page_size: 50,
        })
        .then((response) => {
          const { records } = response;
          const formatedData = records.map((item: any) => ({
            value: item['id'],
            text: `${item['id']} | ${item['name']}`,
          }));
          console.log('getLabels results: ', formatedData);
          // const options = formatedData.map(d => <Option key={d.value}>{d.text}</Option>);
          const options = formatedData.map((d) => {
            return { label: d.text, value: d.value };
          });
          setLoading(false);
          callback(options);
        })
        .catch((error) => {
          console.log('requestNodes Error: ', error);
          callback([]);
          setLoading(false);
        });
    };

    timeout = setTimeout(fetchData, 300);
  };

  const handleSearchNode = function (entityType: string, value: string) {
    if (value) {
      fetchNodes(entityType, value, setEntityOptions);
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
    if (props.searchObject) {
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
                  ? 'Not Found'
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
          placeholder="Please select mode for merging nodes & relationships"
          options={MergeModeOptions}
        ></Select>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 19, span: 5 }}>
        <Button style={{ marginRight: '10px' }} onClick={props.onCancel}>
          Cancel
        </Button>
        <Button type="primary" onClick={onConfirm}>
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SimilarityNodesSearcher;
