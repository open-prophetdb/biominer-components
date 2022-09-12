import React, { useState, useEffect } from 'react';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import { Card, Typography, Alert } from 'antd';
import getLocale from './locales/index';
import { DataSetLocale } from './locales/index.t'
import { DataSetProps } from './index.t';
import './index.less';

const DataSet: React.FC<DataSetProps> = (props) => {
  const {
    locale
  } = props;

  const [localeData, setLocaleData] = useState<DataSetLocale>(getLocale('en_US'));
  useEffect(() => {
    if (locale) {
      setLocaleData(getLocale(locale));
    }
  }, [locale]);

  return (
    <Card className="dataset-container">
      <Alert
        message={localeData.message}
        type="success"
        showIcon
        banner
      />
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        <SmileTwoTone /> OmicsMiner <HeartTwoTone twoToneColor="#eb2f96" /> You
      </Typography.Title>
    </Card>
  );
};
export default DataSet;
