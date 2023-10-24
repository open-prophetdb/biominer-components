import * as React from 'react';
import { Option } from './LayoutNetworks';
import { Slider, Switch, Row, Col, InputNumber, Select } from 'antd';

interface LayoutOptionsPanelProps {
  options?: Option[];
  /** 布局类型 */
  type: string;
  /** 回调函数 */
  handleChange: (type: string, options?: {}) => void;
}

const getAntdComponent = (option: Option, props: any) => {
  const { onChange, value } = props;

  const { min = 0, max = 500, component, key, enums, step = 1 } = option;

  if (component === 'slider') {
    return {
      component: Slider,
      props: {
        min,
        max,
        onChange: (val: any) => {
          onChange(key, val);
        },
        value,
        step,
      },
    };
  }
  if (component === 'input') {
    return {
      component: InputNumber,
      props: {
        onChange: (val: any) => {
          onChange(key, val);
        },
        value,
      },
    };
  }
  if (component === 'switch') {
    return {
      component: Switch,
      props: {
        onChange: (checked: any) => {
          onChange(key, checked);
        },
        checked: value,
        step: 0.01,
      },
    };
  }
  if (component === 'select') {
    return {
      component: Select,
      props: {
        options: enums,
        onChange: (checked: any) => {
          onChange(key, checked);
        },
      },
    };
  }
  if (component === 'text') {
    return {
      component: () => <span>No Settings</span>,
      props: {},
    };
  }
};

const dumpOptions: Option[] = [
  {
    key: 'work-in-progress',
    component: 'text',
    title: 'Work In Progress',
    defaultValue: '',
  },
];

const LayoutOptionsPanel: React.FunctionComponent<LayoutOptionsPanelProps> = (props) => {
  const { options: OPTIONS = dumpOptions, type, handleChange } = props;

  const [options, setOptions] = React.useState({});
  const defaultOptions = OPTIONS.map((c) => {
    const { key, defaultValue } = c;
    return { [key]: defaultValue };
  }).reduce((acc, curr) => {
    return {
      ...acc,
      ...curr,
    };
  }, {});

  const onChange = (key: any, val: any) => {
    const newOptions = {
      ...defaultOptions,
      ...options,
      [key]: val,
    };
    setOptions(newOptions);
    if (handleChange) {
      handleChange(type, newOptions);
    }
  };

  return (
    <Row>
      {OPTIONS
        ? OPTIONS.map((item) => {
            const { title, defaultValue, key } = item;
            // @ts-ignore
            const value = options[key];
            // @ts-ignore
            const { component: Component, props: ComponentProps } = getAntdComponent(item, {
              onChange,
              value: value ? value : defaultValue,
            });
            return (
              <>
                <Col span={12}>{title}</Col>
                <Col span={12}>
                  <Component
                    {...ComponentProps}
                    getPopupContainer={(triggerNode: any) => {
                      return triggerNode;
                    }}
                    style={{ minWidth: '100px' }}
                  />
                </Col>
              </>
            );
          })
        : 'No Options'}
    </Row>
  );
};

export default LayoutOptionsPanel;
