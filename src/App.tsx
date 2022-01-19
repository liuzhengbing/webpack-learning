import React, { useState } from 'react';
import 'moment/locale/zh-cn';
import { map } from 'lodash'; // 按需引入esm
import abc from './assets/images/abc.jpeg';
import { Test } from './pages/test';

export const App: React.FC = () => {
  const [title, setTitle] = useState('hello world');
  const arr = [1, 2, 3, 4];
  console.log('title', title);
  return (
    <>
      <h1 onClick={() => setTitle('123')}>{title}</h1>
      <h1>Welcome, webpack</h1>
      {map(arr, (item, index) => (
        <div key={index}>{item}</div>
      ))}
      {/* <img src={require('./assets/images/abc.jpeg')} alt="abc.jpeg" width="100px"></img> */}
      <img src={abc} alt="abc.jpeg" width="100px"></img>
      {/* <img src="/serve-public-path-url/abc.jpeg" alt="abc.jpeg" width="100px"></img> */}
      <Test />
    </>
  );
};

// 默认js摇树
export function square(x: number) {
  return x * x;
}

export function cube(x: number) {
  return x * x * x;
}
