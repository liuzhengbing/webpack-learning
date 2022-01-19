// 环境变量需要声明，不然ts报错
declare const ICON_URL: string;

// 图片需要声明，不然在ts中无法使用import
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
