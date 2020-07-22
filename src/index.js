import { KafkaConsumer, Producer } from "node-rdkafka";
import devnull from "dev-null";
import { Kafka } from "kafkajs";
import { Observable } from "rxjs";

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
  _kafka;

  constructor(options = {}) {
    if (!options["metadata.broker.list"]) {
      throw new Error("option 'metadata.broker.list' should provide");
    }

    if (!options["group.id"]) {
      throw new Error("option 'group.id' should provide");
    }

    this._options = { ...defaultKafkaConf, ...options };
    this._kafka = new Kafka({
      clientId: this._options["group.id"],
      brokers: this._options["metadata.broker.list"].split(","),
    });
  }

  async createProducer(topic) {
    const producer = this._kafka.producer();
    await producer.connect();

    return {
      send: async (message, partitionKey) => {
        await producer.send({
          topic,
          messages: [
            {
              key: partitionKey ? message[partitionKey] : undefined,
              value: JSON.stringify(message),
            },
          ],
        });
      },
      batchSend: async (messages, partitionKey) => {
        await producer.send({
          topic,
          messages: messages.map(m => ({
            key: partitionKey ? m[partitionKey] : undefined,
            value: JSON.stringify(m),
          })),
        });
      },
    };
  }

  createObservable(topic) {
    const consumer = this._kafka.consumer({
      groupId: this._options["group.id"],
    });

    const run = async observer => {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await observer.next(JSON.parse(message.value.toString()));
        },
      });
    };

    const observable = Observable.create(async observer => {
      await run(observer);
    });

    return observable;
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
      if (err) {
        console.error("messenger from stream error");
        console.error(err);
      }
      process.exit(1);
    });

    stream.consumer.on("event.error", function(err) {
      console.log("messenger from stream.consumer error");
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
      if (err) {
        console.error("messenger to stream error");
        console.error(err);
      }
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
