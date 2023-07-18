import { ReactNode } from 'react';

export type DataItem = [ReactNode, string | number | ReactNode];

export type DataAreaProps = {
  data: DataItem[];
  style?: any;
};
