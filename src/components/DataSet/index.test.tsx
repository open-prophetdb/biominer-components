import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DataSet from './index';
import getLocale from './locales/index';

const locale = getLocale('en_US')

describe('<DataSet />', () => {
  it('Render DataSet with dumi', () => {
    const msg = locale.message;

    render(<DataSet />);
    expect(screen.queryByText(msg)).toBeInTheDocument();
  });
});
