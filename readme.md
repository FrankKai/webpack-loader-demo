### 测试
使用Jest测试loader，并且使用babel-jest是的我们可以用import/export以及async/await。

```js
npm install --save-dev jest babel-jest @babel/core @babel/preset-env
```

```js
// babel.conifg.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
```
我们的loader将处理.txt类型的文件并且通过loader的name option去替换任意的[name]示例。然后它将输出一个包含了default export文本的有效的js模块：

```js
// src/loader.js
export default function loader(source) {
  const options = this.getOptions();

  source = source.replace(/\[name\]/g, options.name);

  return `export default ${JSON.stringify(source)}`;
}
```

我们将用这个loader去处理下面这个文件：

test/example.txt

```js
Hey [name]!
```

请注意，我们后面将使用nodejs以及memfs去运行webpack。这可以允许我们不将output输出到磁盘上并且去观察状态。
```js
npm install --save-dev webpack memfs
```


```js
import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.txt$/,
          use: {
            loader: path.resolve(__dirname, '../src/loader.js'),
            options,
          }
        }
      ]
    }
  })

  // Volume可以理解为文件系统卷，内存上的文件系统卷
  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject)=>{
    compiler.run((err, stats)=>{
      if(err) reject(err)
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats);
    })
  })
}
```
现在，我们写一个测试和npm script去运行。



```js
// test/loader.test.js
/**
 * @jest-environment node
 */
import compiler from './compiler.js';

test('Inserts name and outputs JavaScript', async () => {
  const stats = await compiler('example.txt', { name: 'Alice' });
  const output = stats.toJson({ source: true }).modules[0].source;

  expect(output).toBe('export default "Hey Alice!\\n"');
});
```

package.json
```js
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

```
> webpack-loader-demo@1.0.0 test
> jest

  console.log
    loader before: Hey [name]!

      at Object.log (src/loader.js:4:11)

  console.log
    loader after: Hey Alice!

      at Object.log (src/loader.js:8:11)

 PASS  test/loader.test.js
  ✓ Inserts name and outputs JavaScript (1226 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.859 s, estimated 2 s
Ran all test suites.
```

成功了！
现在开始，你可以去开发、测试、部署你自己的loader。我们期待在社区中分享你的灵感和创造！

[[译]如何写一个webpack Loader？](https://github.com/FrankKai/FrankKai.github.io/issues/263)