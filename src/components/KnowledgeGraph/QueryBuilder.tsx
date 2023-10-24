import React, { useState, useEffect } from 'react';
import { Row, Empty, Select, Button } from 'antd';
import type { APIs, OptionType } from '../typings';
import { fetchNodes } from '../utils';
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
  const [entityOptions, setEntityOptions] = useState<OptionType[] | undefined>(undefined);
  const [entityType, setEntityType] = useState<string>('Gene');

  const handleSelectEntityType = function (value: string) {
    setEntityType(value);
    setEntityOptions(undefined);
    setPlaceholder(`Search ${value} nodes ...`);
  };

  const handleSearch = function (value: string) {
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
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        style={{ width: 'auto', minWidth: '100px' }}
        options={entityTypeOptions}
        onSelect={handleSelectEntityType}
      />
      <Select
        showSearch
        allowClear
        loading={loading}
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        defaultActiveFirstOption={false}
        showArrow={true}
        placeholder={placeholder}
        onSearch={handleSearch}
        onChange={handleChange}
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
                ? `Please select a node type ...`
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
