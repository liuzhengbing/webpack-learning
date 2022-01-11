import * as path from 'path';
import * as webpack from 'webpack';
import 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import PostcssPresetEnv from 'postcss-preset-env';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

type EnvType = "none" | "development" | "production" | undefined

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV as EnvType,
  devtool: process.env.NODE_ENV === 'development'? 'eval-cheap-module-source-map': false,
  entry: './src/index.tsx',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
    // 编译前清除目录
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
    extensions: ['.ts', '.tsx', '.js'], // 自行补全文件后缀
    modules: [ 'node_modules'], // 对于直接声明依赖名的模块（如 react ），设置解析模块时应该搜索的目录，优化打包构建速度
  },
  module: {
    rules: [
      {
        // 处理tsx ts
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              "presets": [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["> 0.25%, not dead"]
                    },
                    // useBuiltIns: "usage",
                    // corejs: "3"
                  }
                ]
              ],
              "plugins": [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: 3,
                    // helpers: true,
                    // regenerator: true
                  }
                ]
              ]
            }
          },
          {
            loader: 'ts-loader', // 代替了babel，配置文件是tsconfig.json
            options: {
              transpileOnly: false, // 默认值false，当为true时则编译器只做语言转换不做类型检查
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              "presets": [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["> 0.25%, not dead"]
                    },
                    // useBuiltIns: "usage",
                    // corejs: "3"
                  }
                ]
              ],
              "plugins": [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: 3,
                    // helpers: true,     // 默认true
                    // regenerator: true  // 默认true
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        // 处理less
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          'style-loader', // 创建style标签，将js中的样式资源插入进行，添加到head中生效
          'css-loader', // 将 CSS 转化成 ESModule 模块，默认开启CSS Module
          {
            loader: 'postcss-loader',  // 给css加厂商前缀和未来css属性兼容
            options: {
              postcssOptions: {
                plugins: [
                  [
                    PostcssPresetEnv   // postcss-preset-env 包含 autoprefixer
                  ],
                ],
              },
            },
          },
          'less-loader' //将less文件编译成css文件
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ // 生成html，自动引入所有bundle
      title: 'webpack-ts-loader',
      template: 'public/index.html', // 配置文件模板
    }),
    new webpack.DefinePlugin({ // 设置环境变量（需要在xxx.d.ts中使用declare声明），并非挂载在window上
      ICON_URL: JSON.stringify('https://sf3-scmcdn-cn.feishucdn.com/goofy/ee/suite/admin/static/imgs/favicon-feishu@900282fec.svg'),
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}',
        enabled: true
      }
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),  // 设置静态打包文件目录
    },
    open: true, // 打开你的默认浏览器
    compress: true, // 在浏览器中以百分比显示编译进度
    hot: true, // 热模块替换
    port: 9000,
    // proxy: {
    //   '/api': {
    //     target: "http://localhost:3000", // 将 URL 中带有 /api 的请求代理到本地的 3000 端口的服务上
    //     pathRewrite: { '^/api': '' }, // 把 URL 中 path 部分的 `api` 移除掉
    //   },
    // }
  },
  cache: {
    type: 'filesystem', // 使用文件缓存
  },
};
export default config;