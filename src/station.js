import { Transform } from "stream";

const noop = function() {};

export class Station extends Transform {
  constructor(onReceive) {
    super({ objectMode: true });
    this._onReceive = onReceive || noop;
  }

  get name() {
    return "abstract station";
  }

  /**
   * 自定义处理函数
   *
   * @param {object} data 数据统一处理成对象
   * @param {string} encoding 编码
   * @param {function} next 回调 next(err, data) 第二个参数是需要传递给下一个 mailbox 的数据
   */
  _transform(data, encoding, next) {
    this._onReceive(data, this.push.bind(this));
    next();
  }

  _flush(cb) {
    cb();
  }
}

export class TBoxStation extends Station {
  get name() {
    return "tbox station";
  }
}

export class ExceptionStation extends Station {
  get name() {
    return "tbox station";
  }
}
