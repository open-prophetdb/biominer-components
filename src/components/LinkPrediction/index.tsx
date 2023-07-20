import { Form, Select, Empty, InputNumber, message, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import type { LinkedNodesSearcherProps } from './index.t';
import { NodeEdgeSearchObjectClass } from './index.t';
import { makeRelationTypes, getMaxDigits, getRelationOption } from './utils';
import { RelationCount, OptionType, ComposeQueryItem } from '../typings';
import { stat_total_relation_count } from '../StatisticsChart/utils';
import { makeQueryEntityStr } from '../KnowledgeGraphEditor/utils';
import { sortBy, uniqBy } from 'lodash';

import './index.less';

let timeout: ReturnType<typeof setTimeout> | null;

const mergeModeOptions = [
  { label: 'Replace', value: 'replace' },
  { label: 'Append', value: 'append' },
  { label: 'Subtract', value: 'subtract' },
];

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

  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [totalLinkedNodes, setTotalLinkedNodes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [relationTypeOptions, setRelationTypeOptions] = useState<OptionType[]>([]);
  const [helpWarning, setHelpWarning] = useState<string>('');

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
            field: 'relationship_type',
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
          const total = response.reduce((acc: number, cur: RelationCount) => acc + cur.ncount, 0);

          setTotalLinkedNodes(total);

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

          callback(o);
        } else {
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
    setRelationTypeOptions(makeRelationTypes(props.relationStat));
    setTotalLinkedNodes(stat_total_relation_count(props.relationStat));
  }, [props.relationStat]);

  useEffect(() => {
    if (entityId && entityType) {
      fetchRelationTypes(
        entityId,
        entityType,
        (o: OptionType[]) => {
          console.log('fetchRelationshipTypes within node mode: ', o);
          if (o.length > 0) {
            const merged = relationTypeOptions?.map((item: OptionType) => {
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
              setRelationTypeOptions(
                // @ts-ignore, It's weird, because the item of filtered_merged is not null.
                filtered_merged.sort((a: OptionType, b: OptionType) => {
                  let anum = parseInt(a.label.split(' ')[0].replace('[', '').replace(']', ''));
                  let bnum = parseInt(b.label.split(' ')[0].replace('[', '').replace(']', ''));
                  return bnum - anum;
                }),
              );
            } else {
              setRelationTypeOptions([]);
            }
          }
        },
        relationTypes,
      );
    }
  }, [entityId, entityType]);

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

          props.onOk(new NodeEdgeSearchObjectClass(payload, values.merge_mode));
        }
      })
      .catch((error) => {
        console.log('onConfirm Error: ', error);
      });
  };

  return (
    <Form
      className="query-form"
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
      <Form.Item label="Total Linked Nodes" name="total_linked_nodes">
        <span>{totalLinkedNodes.toLocaleString()}</span>
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
          onChange={updateFormStatus}
          filterOption={(input, option) => {
            // @ts-ignore
            return option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          allowClear
          autoClearSearchValue={false}
          placeholder="Please select relation types"
          options={relationTypeOptions}
        ></Select>
      </Form.Item>
      <Form.Item
        name="nsteps"
        label="Num of Steps"
        initialValue={1}
        rules={[{ required: false, message: 'Please select your expected nsteps', type: 'number' }]}
      >
        <Select disabled placeholder="Please select nsteps" options={nStepsOptions}></Select>
      </Form.Item>
      <Form.Item
        name="limit"
        label="Max Num of Nodes"
        initialValue={50}
        rules={[{ required: false, message: 'Please input your expected value', type: 'number' }]}
      >
        <InputNumber min={1} max={50} />
      </Form.Item>
      <Form.Item label="Merging Mode" name="merge_mode">
        <Select
          placeholder="Please select mode for merging nodes & relationships"
          options={mergeModeOptions}
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

export default LinkedNodesSearcher;
