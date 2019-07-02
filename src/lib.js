import { Transform } from "stream";

/**
 * 标准kafka数据结构
 *
 * {
 *   value: Buffer.from('hi'), // message contents as a Buffer
 *   size: 2, // size of the message, in bytes
 *   topic: 'librdtesting-01', // topic the message comes from
 *   offset: 1337, // offset the message was read from
 *   partition: 1, // partition the message was on
 *   key: 'someKey', // key of the message if present
 *   timestamp: 1510325354780 // timestamp of message creation
 * }
 *
 */

export class KafkaParser extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk, encoding, next) {
    if (
      typeof chunk !== "object" ||
      !chunk.value ||
      !chunk.value instanceof Buffer
    ) {
      throw new Error("kafka messege not match our format");
    }

    try {
      const dataStr = chunk.value.toString();
      const data = JSON.parse(dataStr);
      this.push(data);
    } catch (e) {
      console.error(e);
    }

    next();
  }
}

export class KafkaBuilder extends Transform {
  constructor({ topic }) {
    super({ objectMode: true });
    this._topic = topic;
  }

  _transform(chunk, encoding, next) {
    let value = chunk;
    if (typeof value === "object") value = JSON.stringify(value);
    if (typeof value === "string") value = Buffer.from(value);
    if (!value instanceof Buffer) throw new Error("value is not buffer");

    this.push({ value, topic: this._topic });
    // this.push(value); // 这块儿每太搞懂
    next();
  }
}
