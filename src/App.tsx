import React, { useState } from 'react';

export const App: React.FC = () => {
  const [title, setTitle] = useState('hello world');
  return (
    <>
      <h1 onClick={() => setTitle('123')}>{title}</h1>
      <h1>Welcome, webpack</h1>
    </>
  );
};