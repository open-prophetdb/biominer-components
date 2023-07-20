import React, { useState, useEffect } from 'react';
import { Row, Empty, Select, Button } from 'antd';
import type { APIs, OptionType } from '../typings';
import { makeQueryEntityStr } from '../KnowledgeGraphEditor/utils';
import './QueryBuilder.less';

let timeout: ReturnType<typeof setTimeout> | null;

type QueryBuilderProps = {
  onChange?: (label: string, value: string | undefined) => void;
  onAdvancedSearch?: () => void;
  entityTypes: string[];
  getEntities: APIs['GetEntitiesFn'];
};

const QueryBuilder: React.FC<QueryBuilderProps> = (props) => {
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>('Search Gene nodes ...');
  const [options, setOptions] = useState<any[] | undefined>(undefined);
  const [entityType, setEntityType] = useState<string>('Gene');

  // This function is used to fetch the nodes of the selected label.
  // All the nodes will be added to the options as a dropdown list.
  const fetch = async (label_type: string, value: string) => {
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
          page_size: 10,
        })
        .then((response) => {
          const { records } = response;
          const formatedData = records.map((item: any) => ({
            value: item['id'],
            text: `${item['id']} | ${item['name']}`,
          }));
          console.log('getEntities results: ', formatedData);
          // const options = formatedData.map(d => <Option key={d.value}>{d.text}</Option>);
          const options = formatedData.map((d) => {
            return { label: d.text, value: d.value };
          });
          setLoading(false);
          setOptions(options);
        })
        .catch((error) => {
          console.log('requestNodes Error: ', error);
          setOptions([]);
          setLoading(false);
        });
    };

    timeout = setTimeout(fetchData, 300);
  };

  const handleSelectEntityType = function (value: string) {
    setEntityType(value);
    setOptions(undefined);
    setPlaceholder(`Search ${value} nodes ...`);
  };

  const handleSearch = function (value: string) {
    if (value) {
      fetch(entityType, value);
    } else {
      setOptions(undefined);
    }
  };

  const handleChange = function (value: string) {
    console.log('Handle Change: ', value);
    if (value) {
      props.onChange?.(entityType, value);
    } else {
      props.onChange?.(entityType, undefined);
    }
  };

  useEffect(() => {
    if (props.entityTypes) {
      let o: OptionType[] = [];
      props.entityTypes.forEach((element: string) => {
        o.push({
          order: 0,
          label: element,
          value: element,
        });
      });

      setEntityTypeOptions(o);
    }
  }, [props.entityTypes]);

  return (
    <Row className="query-builder">
      <Select
        value={entityType}
        style={{ width: 'auto', minWidth: '100px' }}
        options={entityTypeOptions}
        onSelect={handleSelectEntityType}
      />
      <Select
        showSearch
        allowClear
        loading={loading}
        defaultActiveFirstOption={false}
        showArrow={true}
        placeholder={placeholder}
        onSearch={handleSearch}
        onChange={handleChange}
        options={options}
        filterOption={false}
        notFoundContent={
          <Empty
            description={
              loading
                ? 'Searching...'
                : options !== undefined
                ? 'Not Found'
                : `Enter your interested ${entityType} ...`
            }
          />
        }
      ></Select>
      <Button onClick={props.onAdvancedSearch}>Advanced</Button>
    </Row>
  );
};

export default QueryBuilder;
