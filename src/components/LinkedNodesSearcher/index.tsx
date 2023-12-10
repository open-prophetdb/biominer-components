import { Form, Select, Empty, InputNumber, message, Button, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import type { LinkedNodesSearcherProps } from './index.t';
import { LinkedNodesSearchObjectClass } from './index.t';
import { makeRelationTypes, getMaxDigits, getRelationOption } from '../utils';
import {
  type RelationCount,
  type OptionType,
  type ComposeQueryItem,
  MergeModeOptions,
} from '../typings';
import { stat_total_relation_count } from '../StatisticsChart/utils';
import { fetchNodes } from '../utils';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

const nStepsOptions = [
  { label: '1 Step', value: 1 },
  { label: '2 Steps', value: 2 },
  { label: '3 Steps', value: 3 },
  { label: '4 Steps', value: 4 },
  { label: '5 Steps', value: 5 },
];

const LinkedNodesSearcher: React.FC<LinkedNodesSearcherProps> = (props) => {
  const [form] = Form.useForm();
  const entityType = Form.useWatch('entity_type', form);
  const entityId = Form.useWatch('entity_id', form);
  const limit = Form.useWatch('limit', form);
  const nsteps = Form.useWatch('nsteps', form);
  const relationTypes = Form.useWatch('relation_types', form);

  const rawRelationTypeOptions = makeRelationTypes(props.relationStat);
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [totalLinkedNodes, setTotalLinkedNodes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [relationTypeOptions, setRelationTypeOptions] = useState<OptionType[]>([]);
  const [relationTypeOptionsLoading, setRelationTypeOptionsLoading] = useState<boolean>(false);
  const [helpWarning, setHelpWarning] = useState<string>('');

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

  const fetchRelationTypes = async (
    nodeId: string,
    nodeType: string,
    callback: (any: any) => void,
    relationTypes?: string[],
  ) => {
    let query: ComposeQueryItem = {
      operator: 'or',
      items: [
        {
          operator: 'and',
          items: [
            {
              field: 'source_id',
              operator: '=',
              value: nodeId,
            },
            {
              field: 'source_type',
              operator: '=',
              value: nodeType,
            },
          ],
        },
        {
          operator: 'and',
          items: [
            {
              field: 'target_id',
              operator: '=',
              value: nodeId,
            },
            {
              field: 'target_type',
              operator: '=',
              value: nodeType,
            },
          ],
        },
      ],
    };

    if (relationTypes && relationTypes.length > 0) {
      query = {
        operator: 'and',
        items: [
          query,
          {
            field: 'relation_type',
            operator: 'in',
            value: relationTypes,
          },
        ],
      };
    }

    props
      .getRelationCounts({
        query_str: JSON.stringify(query),
      })
      .then((response: RelationCount[]) => {
        console.log('Get relation counts: ', response);
        let o: OptionType[] = [];
        if (response.length > 0) {
          const maxDigits = getMaxDigits(response.map((item: RelationCount) => item.ncount));

          response.forEach((element: RelationCount, index: number) => {
            const relationship = getRelationOption(
              element.relation_type,
              element.resource,
              element.source_type,
              element.target_type,
            );

            o.push({
              order: index,
              label: `[${element.ncount.toString().padStart(maxDigits, '0')}] ${relationship}`,
              value: relationship,
            });
          });

          const total = response.reduce((acc: number, cur: RelationCount) => acc + cur.ncount, 0);
          setTotalLinkedNodes(total);
          callback(o);
        } else {
          setTotalLinkedNodes(0);
          callback([]);
        }
      })
      .catch((error: any) => {
        message.error('Get relations error, please refresh the page and try again.');
        console.log('Get relations error: ', error);
        callback([]);
      });
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
      props.searchObject.get_instance_id() === 'linked-nodes-search-object'
    ) {
      form.setFieldsValue({
        entity_type: props.searchObject.data.entity_type,
        entity_id: props.searchObject.data.entity_id,
        relation_types: props.searchObject.data.relation_types,
        nsteps: props.searchObject.data.nsteps,
        limit: props.searchObject.data.limit,
        merge_mode: props.searchObject.merge_mode,
      });
    }
  }, [props.searchObject]);

  const initForm = () => {
    setRelationTypeOptions(rawRelationTypeOptions);
    setTotalLinkedNodes(stat_total_relation_count(props.relationStat));
  };

  useEffect(() => {
    initForm();
  }, [props.relationStat]);

  useEffect(() => {
    // If we don't reset the relation_types, we cannot get the full relations.
    form.setFieldsValue({
      relation_types: undefined,
    });

    if (entityId && entityType) {
      setRelationTypeOptionsLoading(true);
      fetchRelationTypes(
        entityId,
        entityType,
        (o: OptionType[]) => {
          console.log('fetchRelationshipTypes within node mode: ', o);
          if (o.length > 0) {
            const clonedRelationTypeOptions = [...rawRelationTypeOptions];
            const merged = clonedRelationTypeOptions?.map((item: OptionType) => {
              let matched = o.find((i: OptionType) => {
                const newlabel = i.label.split(' ')[1];
                const oldlabel = item.label.split(' ')[1];
                return oldlabel === newlabel;
              });

              if (matched) {
                return matched;
              } else {
                return null;
                // Don't need to show the relation types that are not linked to the selected node.
                // const oldlabel = item.label.split(' ')[1];
                // return {
                //   order: 9999,
                //   label: `[${'0'.padStart(4, '0')}] ${oldlabel}`,
                //   value: item.value,
                // };
              }
            });

            if (merged) {
              const filtered_merged = merged.filter((item: OptionType | null) => item !== null);
              console.log('Update the number of relationships: ', merged);
              // @ts-ignore, It's weird, because the item of filtered_merged is not null.
              const options = filtered_merged.sort((a: OptionType, b: OptionType) => {
                let anum = parseInt(a.label.split(' ')[0].replace('[', '').replace(']', ''));
                let bnum = parseInt(b.label.split(' ')[0].replace('[', '').replace(']', ''));
                return bnum - anum;
              }) as OptionType[];

              setRelationTypeOptions(uniqBy(options, 'value'));
              setRelationTypeOptionsLoading(false);
            } else {
              setRelationTypeOptions([]);
              setRelationTypeOptionsLoading(false);
            }
          } else {
            setRelationTypeOptions([]);
            setRelationTypeOptionsLoading(false);
          }
        },
        relationTypes,
      );
    }
  }, [entityId, entityType]);

  useEffect(() => {
    initForm();
  }, [entityType]);

  const updateFormStatus = function () {
    setHelpWarning('');
  };

  const onConfirm = function () {
    form
      .validateFields()
      .then((values) => {
        if (props.onOk) {
          let payload = {
            entity_type: values.entity_type,
            entity_id: values.entity_id,
            relation_types: values.relation_types ? values.relation_types : [],
            nsteps: values.nsteps ? values.nsteps : 1,
            limit: values.limit ? values.limit : 50,
          };

          props.onOk(new LinkedNodesSearchObjectClass(payload, values.merge_mode));
        }
      })
      .catch((error) => {
        console.log('onConfirm Error: ', error);
      });
  };

  return (
    <Form
      className="linked-nodes-searcher"
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
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
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
      <Form.Item label="Total Linked Nodes" name="total_linked_nodes">
        <Spin size="small" spinning={relationTypeOptionsLoading}>
          <span>{totalLinkedNodes.toLocaleString()}</span>
        </Spin>
      </Form.Item>
      <Form.Item
        name="relation_types"
        label="Relation Types"
        validateStatus={helpWarning ? 'warning' : ''}
        help={helpWarning}
        rules={[
          {
            required: false,
            message: 'Please select your expected relation types!',
            type: 'array',
          },
        ]}
      >
        <Select
          mode="multiple"
          loading={relationTypeOptionsLoading}
          onChange={updateFormStatus}
          filterOption={(input, option) => {
            // @ts-ignore
            return option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          allowClear
          autoClearSearchValue={false}
          placeholder="Please select relation types"
          // options={relationTypeOptions}
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
        name="nsteps"
        label="Num of Steps"
        initialValue={1}
        hidden
        rules={[{ required: false, message: 'Please select your expected nsteps', type: 'number' }]}
      >
        <Select
          disabled
          placeholder="Please select nsteps"
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentNode;
          }}
          options={nStepsOptions}
        ></Select>
      </Form.Item>
      <Form.Item
        name="limit"
        label="Max Num of Nodes"
        initialValue={50}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={50} />
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
            initForm();
          }}
        >
          Reset
        </Button>
        <Button type="primary" onClick={onConfirm} disabled={totalLinkedNodes == 0}>
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LinkedNodesSearcher;
