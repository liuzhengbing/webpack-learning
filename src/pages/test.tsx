import React from 'react';
import { map } from 'lodash'; // 按需引入esm
import { Button, DatePicker } from 'antd';

export const Test: React.FC = () => {
  const arr = [1, 2, 3, 4];
  return (
    <>
      <h1>Welcome, test</h1>
      {map(arr, (item, index) => (
        <div key={index}>{item}</div>
      ))}
      <DatePicker />
      <Button type="primary" style={{ marginLeft: 8 }}>
        Primary Button
      </Button>
    </>
  );
};
