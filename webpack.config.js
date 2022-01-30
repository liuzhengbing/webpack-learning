const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PostcssPresetEnv = require('postcss-preset-env');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 打包时，css文件抽离
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // 打包时，css压缩
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // 查看打包后生成的 bundle 体积分析

const isProduction = process.env.NODE_ENV === 'production';

// 常用cdn：http://www.staticfile.org/   https://cdn.baomitu.com/
const cdnList = [
  {
    key: 'react',
    value: 'React',
    scriptDevelopment:
      '<script crossorigin="anonymous"  src="https://cdn.staticfile.org/react/17.0.2/umd/react.development.min.js"></script>',
    scriptProduction:
      '<script crossorigin="anonymous"  src="https://cdn.staticfile.org/react/17.0.2/umd/react.production.min.js"></script>',
  },
  {
    key: 'react-dom',
    value: 'ReactDOM',
    scriptDevelopment:
      '<script crossorigin="anonymous" src="https://cdn.staticfile.org/react-dom/17.0.2/umd/react-dom.development.min.js"></script>',
    scriptProduction:
      '<script crossorigin="anonymous"  src="https://cdn.staticfile.org/react-dom/17.0.2/umd/react-dom.production.min.js"></script>',
  },
];

const externals = {};
const scriptList = [];
cdnList.forEach((item) => {
  externals[item.key] = item.value;
  isProduction ? scriptList.push(item.scriptProduction) : scriptList.push(item.scriptDevelopment);
});

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: isProduction ? false : 'eval-cheap-module-source-map',
  entry: './src/index.tsx',
  output: {
    filename: isProduction ? '[name].[contenthash].bundle.js' : '[name].bundle.js', // 生产模式通过设置hash来更新CDN缓存，以防文件名相同，CDN不更新缓存，页面不会刷新
    chunkFilename: isProduction ? '[id].[contenthash].js' : '[id].js',
    path: path.resolve(__dirname, 'build'),
    // 编译前清除目录
    clean: true,

    // publicPath: 'auto', // 默认
    // publicPath: './',  // 相对于index.html获取资源，如<script src="./app.js"></script>
    // publicPath: '/assets/',
    // 从当前服务器根路径获取资源，如<script src="/assets/app.js"></script>，通过xxx:9000/assets/来访问线上服务器，需要设置前端路由的base为”assets“
    // publicPath: 'https://cdn.example.com/assets/',
    // 从https://cdn.example.com/assets/ 获取资源，如<script src="https://cdn.example.com/assets/app.js"></script>
  },
  // cdn引入第三方库
  externals: externals,
  // performance: {
  //   maxEntrypointSize: 512000,
  //   maxAssetSize: 512000,
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      lodash: 'lodash-es', // 第三方库使用lodash，而你使用lodash-es，为了防止lodash被打包2次，使用别名
    },
    extensions: ['.ts', '.tsx', '.js'], // 自行补全文件后缀
    modules: ['node_modules'], // 对于直接声明依赖名的模块（如 react ），设置解析模块时应该搜索的目录，优化打包构建速度
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|jsx|tsx)$/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'es2015',
              // tsconfigRaw: require('./tsconfig.json') // 默认加载
            },
          }
        ]
      },
      {
        // 处理less
        test: /\.less$/,
        // exclude: /node_modules/,
        use: [
          // 'style-loader':创建style标签，将js中的样式资源插入进行，添加到head中生效
          // MiniCssExtractPlugin: 创建link标签，链接css样式
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // 仅生产环境
          'css-loader', // 将 CSS 转化成 ESModule 模块，默认开启CSS Module
          {
            loader: 'postcss-loader', // 给css加厂商前缀和未来css属性兼容
            options: {
              postcssOptions: {
                plugins: [
                  [
                    PostcssPresetEnv, // postcss-preset-env 包含 autoprefixer
                  ],
                ],
              },
            },
          },
          {
            loader: 'less-loader', //将less文件编译成css文件
            options: {
              lessOptions: {
                modifyVars: { '@primary-color': '#1DA57A' },
                javascriptEnabled: true, // 自定义antd.less主题
              },
            },
          },
        ],
      },
      {
        // 处理css
        test: /\.css$/,
        use: [
          // 'style-loader':创建style标签，将js中的样式资源插入进行，添加到head中生效
          // MiniCssExtractPlugin: 创建link标签，链接css样式
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // 仅生产环境
          'css-loader', // 将 CSS 转化成 ESModule 模块，默认开启CSS Module
          {
            loader: 'postcss-loader', // 给css加厂商前缀和未来css属性兼容
            options: {
              postcssOptions: {
                plugins: [
                  [
                    PostcssPresetEnv, // postcss-preset-env 包含 autoprefixer
                  ],
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        include: path.resolve(__dirname, 'src'),
        type: 'asset',
        generator: {
          filename: 'static/images/[hash][ext][query]',
        },
        parser: {
          dataUrlCondition: {
            // 设置体积限制大小
            maxSize: 4 * 1024, // 4kb，小于4k：inline（文件将作为 data URI 注入到 bundle 中）
          },
        },
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/i,
        include: path.resolve(__dirname, 'src'),
        type: 'asset/resource',
        generator: {
          filename: 'static/font/[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // 生成html，自动引入所有bundle
      title: 'webpack-ts-loader',
      template: 'public/index.html', // 配置文件模板
      // publicPath: './',
      scriptList,
    }),
    new webpack.DefinePlugin({
      // 设置环境变量（需要在xxx.d.ts中使用declare声明），并非挂载在window上
      ICON_URL: JSON.stringify(
        'https://sf3-scmcdn-cn.feishucdn.com/goofy/ee/suite/admin/static/imgs/favicon-feishu@900282fec.svg'
      ),
      BUILD_TYPE: JSON.stringify(process.env.NODE_ENV),
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}',
        enabled: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      chunkFilename: isProduction ? '[id].[contenthash].css' : '[id].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
    new webpack.IgnorePlugin({
      // 过滤moment/locale语音包，在使用时import 'moment/locale/zh-cn';
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new BundleAnalyzerPlugin(),
  ],
  optimization: isProduction
    ? {
        minimize: true,
        minimizer: [new CssMinimizerPlugin(), '...'], // 开发模式有冲突
        splitChunks: {
          chunks: 'all', // 选择哪些 chunk 进行优化: initial、async和all
          minSize: 20000, // 形成一个新代码块最小的体积
          maxAsyncRequests: 30, // 按需加载时候最大的并行请求数
          maxInitialRequests: 30, // 最大初始化请求数
          cacheGroups: {
            react: {
              // 基本框架
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 0,
              name: 'vendor',
            },
            lodash: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]lodash-es[\\/]/,
              priority: 0,
              name: 'lodash',
            },
            antd: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              priority: 0,
              name: 'antd',
            },
            moment: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]moment[\\/]/,
              priority: 0,
              name: 'moment',
            },
            echarts: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]echarts[\\/]/,
              priority: 0,
              name: 'echartsVendor',
            },
            'rc-picker': {
              chunks: 'all',
              test: /rc-picker/,
              priority: 0,
              name: 'rcPicker',
            },
            'rc-vendor': {
              chunks: 'all',
              test: /rc-/,
              priority: 0,
              name: 'rcVendor',
            },
          },
        },
      }
    : {
        minimize: true,
        splitChunks: {
          chunks: 'all', // 选择哪些 chunk 进行优化: initial、async和all
          minSize: 20000, // 形成一个新代码块最小的体积
          maxAsyncRequests: 30, // 按需加载时候最大的并行请求数
          maxInitialRequests: 30, // 最大初始化请求数
          cacheGroups: {
            react: {
              // 基本框架
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 0,
              name: 'vendor',
            },
            lodash: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]lodash-es[\\/]/,
              priority: 0,
              name: 'lodash',
            },
            antd: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              priority: 0,
              name: 'antd',
            },
            moment: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]moment[\\/]/,
              priority: 0,
              name: 'moment',
            },
            echarts: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]echarts[\\/]/,
              priority: 0,
              name: 'echartsVendor',
            },
            'rc-picker': {
              chunks: 'all',
              test: /rc-picker/,
              priority: 0,
              name: 'rcPicker',
            },
            'rc-vendor': {
              chunks: 'all',
              test: /rc-/,
              priority: 0,
              name: 'rcVendor',
            },
          },
        },
      },
  devServer: {
    // 访问/serve-public-path-url相当于访问src/assets/images
    // static: {
    //   directory: path.join(__dirname, 'src/assets/images'),
    //   publicPath: '/serve-public-path-url',
    // },
    open: true, // 打开你的默认浏览器
    compress: true, // 在浏览器中以百分比显示编译进度
    hot: true, // 热模块替换
    port: 9000,
    // proxy: {
    //   '/api': {
    //     target: "http://localhost:9000", // 将 URL 中带有 /api 的请求代理到本地的 9000 端口的服务上
    //     pathRewrite: { '^/api': '' }, // 把 URL 中 path 部分的 `api` 移除掉
    //   },
    // }
  },
  cache: {
    type: 'filesystem', // 使用文件缓存:引入缓存后，首次构建时间将增加 15%，二次构建时间将减少 90%
  },
};
