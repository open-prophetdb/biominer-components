import React, { useState, useEffect } from 'react';
import { Button, Form, Select, message, Empty, Input, Row, InputNumber, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { makeQueryEntityStr } from '../utils';
import { getIdentity } from '../utils';
import { sortBy } from 'lodash';
import v from 'voca';
import MarkdownViewer from '../MarkdownViewer';
import { RelationTypeDict, RelationType, GraphFormProps } from './index.t';
import type {
  Entity,
  OptionType,
  EntityRecordsResponse,
  EntityStat,
  RelationStat,
  StatisticsResponse,
} from '../typings';

import './GraphForm.less';
import { MarkdownParams } from '../MarkdownViewer/index.t';

export let timeout: ReturnType<typeof setTimeout> | null;
const helpDoc = () => {
  return (
    <span>
      The knowledge graph editor is a tool to help curate knowledges from the literatures. It use
      the triplet format to represent the knowledge. Each triplet is a directed edge with a source
      node, a target node and a relation type. The source and target node can be any biological
      entities, such as gene, disease, drug, etc.{' '}
      <b>
        Please read the help doc carefully before you start. If you have any questions, please{' '}
        <a href="mailto:jyang85@mgh.harvard.edu">contact us</a>.
      </b>
    </span>
  );
};

const idTooltip = () => {
  return (
    <>
      <span>Please enter your interested node. Such as TP53, Fatigue, etc.</span>
      <br />
      <span>In case of duplicate ID:</span>
      <br />
      <span>- For disease, use the MESH ID</span>
      <br />
      <span>- For gene, use the correct ID corresponding to the source species</span>
    </>
  );
};

const GraphForm: React.FC<GraphFormProps> = (props) => {
  const [form] = Form.useForm();
  const sourceType = Form.useWatch('source_type', form);
  const targetType = Form.useWatch('target_type', form);

  const [statistics, setStatistics] = useState<StatisticsResponse>({} as StatisticsResponse);
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>('Search nodes ...');

  const [entityOptions, setEntityOptions] = useState<any[] | undefined>(undefined);
  const [relationOptions, setRelationOptions] = useState<OptionType[]>([]);

  const [visible, setVisible] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<'manual' | 'help'>('help');

  const formatEntityTypeOptions = (items: EntityStat[]) => {
    let o: OptionType[] = [];
    let nodeTypes = new Set(
      items.map((item: EntityStat) => {
        return item.entity_type;
      }),
    );
    if (nodeTypes) {
      nodeTypes.forEach((element: string) => {
        o.push({
          order: 0,
          label: element,
          value: element,
        });
      });
      setEntityTypeOptions(sortBy(o, 'label'));
    } else {
      setEntityTypeOptions([]);
    }
  };

  const formatRelationOption = (items: RelationStat[], sourceType: string, targetType: string) => {
    const filtered = items.filter((item: RelationStat) => {
      return (
        (item.start_entity_type == sourceType && item.end_entity_type == targetType) ||
        (item.start_entity_type == targetType && item.end_entity_type == sourceType)
      );
    });

    const relationshipTypes = filtered.map((item: RelationStat) => {
      // relation_type is in the format of "resource::relation_type::source_type:target_type", such as DGIDB::MODULATOR::Gene:Compound
      return {
        fullRelationType: item.relation_type,
        source: item.relation_type.split('::')[0],
        relationType: item.relation_type
          .replace(/^[a-zA-Z0-9]+::/g, '')
          .replace(`::${item.start_entity_type}:${item.end_entity_type}`, ''),
        description: item.description ? item.description : '',
      };
    });

    const formatRelType = (item: RelationType) => {
      const r = RelationTypeDict[item.relationType]
        ? RelationTypeDict[item.relationType]
        : item.relationType;
      return v.titleCase(`${r}`) + ` [${item.source}]`;
    };

    const relationOptions = sortBy(
      relationshipTypes.map((item: RelationType) => {
        return {
          order: 0,
          label: formatRelType(item),
          value: item.fullRelationType,
          description: item.description,
        };
      }),
      ['label'],
    );

    setRelationOptions(relationOptions);
  };

  const updateCuratorId = () => {
    if (props.curator) {
      form.setFieldsValue({ curator: props.curator });
    } else {
      getIdentity().then((visitorId) => {
        localStorage.setItem('rapex-visitor-id', visitorId as string);
        form.setFieldsValue({ curator: visitorId });
      });
    }
  };

  useEffect(() => {
    props
      .getStatistics()
      .then((response: StatisticsResponse) => {
        setStatistics(response);
      })
      .catch((error: any) => {
        console.log(error);
        message.error('Failed to get statistics, please check the network connection.');
      });

    updateCuratorId();
  }, []);

  useEffect(() => {
    if (statistics.entity_stat) {
      formatEntityTypeOptions(statistics.entity_stat);
    }

    if (statistics.relation_stat && sourceType && targetType) {
      formatRelationOption(statistics.relation_stat, sourceType, targetType);
    }

    updateCuratorId();
  }, [statistics, sourceType, targetType]);

  useEffect(() => {
    if (props.formData) {
      form.setFieldsValue(props.formData);
    }
  }, [props.formData]);

  // This function is used to fetch the entities of the selected entity type.
  // All the entities will be added to the options as a dropdown list.
  const fetchEntities = async (entityType: string, value: string, callback: (any: any) => void) => {
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
          page_size: 100,
        })
        .then((response: EntityRecordsResponse) => {
          const { records } = response;
          const formatedData = records.map((item: Entity) => ({
            value: `${item['id']}`,
            text: formatLabelOption(item),
          }));
          console.log('Get Entities: ', formatedData, records);
          // const options = formatedData.map(d => <Option key={d.value}>{d.text}</Option>);
          const options = formatedData.map((d: any) => {
            return { label: d.text, value: d.value };
          });

          setLoading(false);
          callback(sortBy(options, ['label']));
        })
        .catch((error: any) => {
          console.log('requestNodes Error: ', error);
          callback([]);
          setLoading(false);
        });
    };

    timeout = setTimeout(fetchData, 300);
  };

  const handleSelectEntityType = function (value: string) {
    setEntityOptions(undefined);
    setPlaceholder(`Search ${value} nodes ...`);
  };

  const handleSearchEntity = function (entityType: string, value: string) {
    if (value) {
      fetchEntities(entityType, value, setEntityOptions);
    } else {
      setEntityOptions(undefined);
    }
  };

  const openDoc = (anchor: 'manual' | 'help') => {
    setVisible(true);
    setAnchor(anchor);
  };

  const formatLabelOption = (item: Entity) => {
    if (item.label == 'Gene') {
      // TODO: How to deal with multiple species in the future?
      if (item.taxid) {
        return `${item.name} | ${item.id} | ${item.taxid} | ${item.resource}`;
      } else {
        return `${item.name} | ${item.id} | Homo sapiens | ${item.resource}`;
      }
    } else {
      return `${item.name} | ${item.id} | ${item.resource}`;
    }
  };

  const handleSelectEntity = (fieldName: 'source' | 'target', value: string, option: any) => {
    console.log('handleSelectEntity: ', value, option);
    const id = value;
    // Please notice that the label is in the format of "name | id | resource"
    // NOTE: Must keep consistent with formatLabelOption function
    const type = option.label.split(' | ')[0];

    console.log('handleSelectEntityType: ', fieldName, value, option);
    if (fieldName == 'source') {
      form.setFieldsValue({ source_id: id });
      form.setFieldsValue({ source_name: type });
    } else if (fieldName == 'target') {
      form.setFieldsValue({ target_id: id });
      form.setFieldsValue({ target_name: type });
    }
  };

  const onClose = () => {
    form.resetFields();
    if (props.onClose) {
      props.onClose();
    }
  };

  const onCancel = () => {
    setVisible(false);
  };

  const getFile = (params: MarkdownParams) => {
    console.log('getFile params: ', params);
    return fetch(params.filelink)
      .then((response) => response.text())
      .then((text) => {
        return text;
      });
  };

  const onConfirm = () => {
    setButtonLoading(true);
    form
      .validateFields()
      .then((values) => {
        console.log('onConfirm form values: ', values);
        if (props.onSubmit) {
          let payload = {
            ...values,
          };

          if (props.formData) {
            payload = {
              ...payload,
              id: props.formData.id,
            };
          }

          props
            .onSubmit(payload)
            .then(() => {
              form.resetFields();
              setButtonLoading(false);
            })
            .catch((error: any) => {
              console.log('onConfirm error: ', error);
              message.error('Submit error, please try later!');
              setButtonLoading(false);
            });
        }
      })
      .catch((errorInfo) => {
        message.error('Unknow error, please try later!');
        console.log('errorInfo: ', errorInfo);
        setButtonLoading(false);
      });
  };

  return (
    <Row className="graph-form-container">
      <h3 className="title">
        <span style={{ marginRight: '5px' }}>Graph Form</span>
        <Button className="help-button" type="primary" size="small" onClick={() => openDoc('help')}>
          Help
        </Button>
        <Button
          className="help-button"
          type="primary"
          size="small"
          onClick={() => openDoc('manual')}
        >
          Manual
        </Button>
      </h3>
      <p className="graph-help">{helpDoc()}</p>
      <Modal
        className="help-container"
        title={v.titleCase(anchor)}
        onCancel={onCancel}
        open={visible}
        destroyOnClose={true}
        footer={null}
        width={'60%'}
      >
        <MarkdownViewer
          // @ts-ignore
          url={`${window.publicPath}README/knowledge_editor_${anchor}.md`}
          getFile={undefined}
        />
      </Modal>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        form={form}
        className="graph-form"
        autoComplete="on"
        labelAlign="left"
      >
        <Form.Item
          label="Source Node Type"
          name="source_type"
          tooltip="Please select a node type."
          rules={[{ required: true, message: 'Please select a node type.' }]}
        >
          <Select
            allowClear
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode;
            }}
            defaultActiveFirstOption={false}
            placeholder="Please select a node type."
            options={entityTypeOptions}
            filterOption={true}
            onSelect={handleSelectEntityType}
          />
        </Form.Item>

        <Form.Item
          label="Source Node ID"
          name="source_id"
          tooltip={idTooltip()}
          rules={[{ required: true, message: 'Please enter your expected node.' }]}
        >
          <Select
            showSearch
            allowClear
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode;
            }}
            loading={loading}
            defaultActiveFirstOption={false}
            placeholder={placeholder}
            onSearch={(value) => handleSearchEntity(sourceType, value)}
            options={entityOptions}
            filterOption={false}
            onSelect={(value, options) => handleSelectEntity('source', value, options)}
            notFoundContent={
              <Empty
                description={
                  loading
                    ? 'Searching...'
                    : entityOptions !== undefined
                      ? 'Not Found or Too Short Input'
                      : sourceType
                        ? `Enter your interested ${sourceType} ...`
                        : 'Select source node type first.'
                }
              />
            }
          ></Select>
        </Form.Item>

        <Form.Item
          label="Source Node Name"
          name="source_name"
          hidden
          rules={[{ required: true, message: 'Please enter your expected node.' }]}
        >
          <Input placeholder="Please enter the source node name" disabled />
        </Form.Item>

        <Form.Item
          label="Target Node Type"
          name="target_type"
          tooltip="Please select a node type."
          rules={[{ required: true, message: 'Please select a node type.' }]}
        >
          <Select
            allowClear
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode;
            }}
            defaultActiveFirstOption={false}
            placeholder="Please select a node type."
            options={entityTypeOptions}
            filterOption={true}
            onSelect={handleSelectEntityType}
          />
        </Form.Item>

        <Form.Item
          label="Target Node ID"
          name="target_id"
          tooltip={idTooltip()}
          rules={[{ required: true, message: 'Please enter your expected node.' }]}
        >
          <Select
            showSearch
            allowClear
            loading={loading}
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode;
            }}
            defaultActiveFirstOption={false}
            placeholder={placeholder}
            onSearch={(value) => handleSearchEntity(targetType, value)}
            options={entityOptions}
            filterOption={false}
            onSelect={(value, options) => handleSelectEntity('target', value, options)}
            notFoundContent={
              <Empty
                description={
                  loading
                    ? 'Searching...'
                    : entityOptions !== undefined
                      ? 'Not Found or Too Short Input'
                      : targetType
                        ? `Enter your interested ${targetType} ...`
                        : 'Select source node type first.'
                }
              />
            }
          ></Select>
        </Form.Item>

        <Form.Item
          label="Target Node Name"
          name="target_name"
          hidden
          rules={[{ required: true, message: 'Please enter your expected node.' }]}
        >
          <Input placeholder="Please enter the target node name" disabled />
        </Form.Item>

        <Form.Item
          label="Relation Type"
          name="relation_type"
          tooltip="Please enter relationship type."
          rules={[{ required: true, message: 'Please enter relationship type.' }]}
        >
          <Select
            showSearch
            allowClear
            loading={loading}
            getPopupContainer={(triggerNode) => {
              return triggerNode.parentNode;
            }}
            defaultActiveFirstOption={false}
            placeholder="Please select a relationship type."
            // options={relationOptions}
            filterOption={false}
            notFoundContent={
              <Empty
                description={
                  relationOptions ? 'Select source node and target node first.' : 'Not Found'
                }
              />
            }
          >
            {relationOptions.map((item: OptionType & { description?: string }) => {
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
          label="PMID"
          name="pmid"
          tooltip="Please enter pmid which is related with your curated knowledge."
          rules={[
            {
              required: true,
              message: 'Please enter pmid which is related with your curated knowledge.',
            },
          ]}
        >
          <InputNumber
            placeholder="Please enter the pmid"
            min={1}
            max={100000000}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Curator"
          name="curator"
          rules={[{ required: false, message: 'Please enter your name.' }]}
        >
          <Input placeholder="Please enter your name" disabled />
        </Form.Item>

        <Form.Item
          label="Key Sentence"
          name="key_sentence"
          tooltip="Please choose the key sentence which can describe the relationship between the source node and the target node best from the paper.If necessary, please improve it for human readable."
          rules={[{ required: true, message: 'Please input key sentence!' }]}
        >
          <TextArea rows={8} placeholder="Please input key sentence!" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 14 }}>
          <Button style={{ marginRight: '10px' }} onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" onClick={onConfirm} loading={buttonLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Row>
  );
};

export default GraphForm;
