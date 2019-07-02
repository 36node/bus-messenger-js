# @36node/bus-messenger

[![version][0]][1] [![downloads][2]][3]

## Install

```bash
yarn add module
```

## Usage

```js
const Messenger, { TBoxStation } = require("@36node/bus-messenger");

const tbox = new TBoxStation((data, push) => {
  push(data);
});

messenger
  .from("test")
  .pass(tbox)
  .deliver(writer);
```

## Test

```sh
yarn test
```

### Mac OS High Sierra / Mojave

OpenSSL has been upgraded in High Sierra and homebrew does not overwrite default system libraries. That means when building node-rdkafka, because you are using openssl, you need to tell the linker where to find it:

```sh
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**module** © [36node](https://github.com/36node), Released under the [MIT](./LICENSE) License.

Authored and maintained by 36node with help from contributors ([list](https://github.com/36node/module/contributors)).

> GitHub [@36node](https://github.com/36node)

[0]: https://img.shields.io/npm/v/@36node/bus-messenger.svg?style=flat
[1]: https://npmjs.com/package/@36node/bus-messenger
[2]: https://img.shields.io/npm/dm/@36node/bus-messenger.svg?style=flat
[3]: https://npmjs.com/package/@36node/bus-messenger
