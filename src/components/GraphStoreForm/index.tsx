import React, { useContext } from 'react';
import { GraphinContext } from '@antv/graphin';
import { Button, Form, Input, message, Modal, Spin } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import type { GraphFormProps } from './index.t';
import { prepareGraphData } from '../utils';
import { getIdentity } from '../utils';
import { CloudUploadOutlined } from '@ant-design/icons';

import './index.less';

const GraphForm: React.FC<GraphFormProps> = (props) => {
  const { graph } = useContext(GraphinContext);
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    if (props.payload) {
      let payload = props.payload;
      if (graph) {
        console.log('Save graph data which are from graphin.');
        // We use the graphin data from the prepareGraphData function and merge other attributes from the payload.
        // Such as data, layout, toolbarVisible, isDirty, currentUUID and so on.
        payload = {
          ...payload,
          ...prepareGraphData(graph),
        };
      }

      const owner = await getIdentity();
      let submitData = {
        payload: JSON.stringify(payload),
        ...values,
        id: '0',
        created_time: undefined,
        // TODO: Allow to get these values from the server
        db_version: 'v1.0.0',
        version: 'v1.0.0',
      };

      submitData = {
        ...submitData,
        // NOTE: You must keep the value of anonymous user same as the server side
        owner: owner ? owner : 'ANONYMOUS-USER-PLACEHOLDER',
      };

      props.onSubmit &&
        props
          .onSubmit(submitData)
          .then(() => {
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
    } else {
      message.error('Failed to submit graph, you must provide a payload for your graph');
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Failed to submit graph');
  };

  return (
    <Modal
      className="graph-form"
      title="Save the current graph"
      open={props.visible}
      footer={null}
      width={500}
      closable={true}
      onCancel={props.onClose}
      destroyOnClose
      getContainer={props.parent ? props.parent : document.body}
    >
      <Spin spinning={loading} tip="Submitting...">
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="name"
            name="name"
            rules={[{ required: true, message: 'Please input a graph name!' }]}
          >
            <Input placeholder="Please input a graph name" />
          </Form.Item>

          <Form.Item
            label="description"
            name="description"
            rules={[{ required: false, message: 'Please input description!' }]}
          >
            <TextArea rows={5} placeholder="Please input description!" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 18, span: 5 }} hidden={!props.onSubmit}>
            <Button type="primary" htmlType="submit">
              <CloudUploadOutlined /> Submit
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GraphForm;
