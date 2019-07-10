import { Transform } from "stream";

const noop = function() {};

/**
 * 消息中转转
 */
export class Station extends Transform {
  /**
   * IHandler 消息处理函数
   *
   * @callback IHandler
   * @param {Object} data 消息对象
   * @param {function} push 将消息传递给下一个中转站的方法
   */

  /**
   * 消息中转站构造函数
   *
   * @param {IHandler} handler
   */
  constructor(handler = noop) {
    super({ objectMode: true });
    this._handler = handler;
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
    const res = this._handler(data, this.push.bind(this));

    if (res instanceof Promise) {
      res.then(() => next()).catch(err => next(err));
    } else {
      next(res);
    }
  }

  _flush(cb) {
    cb();
  }
}

/**
 * TBox 数据中转站
 */
export class TBoxStation extends Station {
  get name() {
    return "Tbox";
  }
}

/**
 * 报警数据中转站
 */
export class AlertStation extends Station {
  get name() {
    return "Alert";
  }
}
