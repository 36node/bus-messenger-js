import { KafkaConsumer, Producer } from "node-rdkafka";
import devnull from "dev-null";

import { KafkaBuilder, KafkaParser } from "./lib";

export * from "./station";

const defaultStreamConf = {
  // topics: 'test',
  waitInterval: 0,
  objectMode: true,
};

const defaultKafkaConf = {
  // "metadata.broker.list": "localhost:9092",
  // "group.id": "librd-test",
  "socket.keepalive.enable": true,
  "enable.auto.commit": false,
};

export class Messenger {
  _stations = [];
  _stream;

  constructor(options = {}) {
    if (!options["metadata.broker.list"]) {
      throw new Error("option 'metadata.broker.list' should provide");
    }

    if (!options["group.id"]) {
      throw new Error("option 'group.id' should provide");
    }

    this._options = { ...defaultKafkaConf, ...options };
  }

  /**
   * 从某个 topics 读取
   *
   * @param {string|[string]} topics 单个或者数组
   */
  from(topics) {
    const stream = KafkaConsumer.createReadStream(
      this._options,
      {},
      { ...defaultStreamConf, topics }
    );

    stream.on("error", function(err) {
      if (err) console.log(err);
      process.exit(1);
    });

    stream.consumer.on("event.error", function(err) {
      console.error(err);
    });

    return this.pickup(stream.pipe(new KafkaParser()));
  }

  /**
   * 发布到某个 topic
   *
   * @param {string} topic topic
   */
  to(topic) {
    const stream = Producer.createWriteStream(
      this._options,
      {},
      { ...defaultStreamConf, topic }
    );

    stream.on("error", function(err) {
      if (err) console.log(err);
      process.exit(1);
    });

    this._stream = this._stream.pipe(new KafkaBuilder({ topic }));
    return this.deliver(stream);
  }

  /**
   * 发送到下一个站点
   *
   * @param {TransformStream} station 下一个站点
   */
  pass(station) {
    this._stream = this._stream.pipe(station);
    return this;
  }

  /**
   * 消息开始流动, 如果没有指定目的地，则流动到 /dev/null 里
   *
   * @param {WritableStream} writeStream
   */
  deliver(writeStream) {
    const end = writeStream || devnull();
    this._stream.pipe(end);
    return this;
  }

  /**
   * 从某个 stream 读入
   *
   * @param {WriteStream} readStream
   */
  pickup(readStream) {
    this._stream = readStream;
    return this;
  }
}

export default Messenger;
