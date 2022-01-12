import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './global.less';

console.log('环境变量:111', ICON_URL, process.env.NODE_ENV);
ReactDOM.render(<App />, document.getElementById('root'));
