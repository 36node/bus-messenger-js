import { Transform } from "stream";

type TBoxData = {
  session: string;
  seq: number;
  time: number;
  platform: string;
  command: string;
  at: Date;
  sn: string;
  iccid: string;
  flag: string;
  vin: string;
  encrypt: string;
  length: number;
  body: object;
};

type AlertData = {
  ns: string;
  at: Date;
  type: number; // code 的前两位是 type，用type来区分 国标报警还是自定义报警，或者是系统预警
  code: number;
  level: number;
  line: string;
  plate: string;
  vehicle: {
    id: string;
    model: string;
    modelBrief: string;
    customNo: string;
    mileage: number;
    expiredAt: Date;
    location: object;
    overall: object;
  };
};

type Push = (data: any) => void;

declare module "@36node/bus-messenger" {
  export class TBoxStation extends Station {
    constructor(handler: (data: TBoxData, push: Push) => void);

    name: string;
  }

  export class AlertStation extends Station {
    constructor(handler: (data: AlertData, push: Push) => void);

    name: string;
  }

  export class Station extends Transform {
    constructor(handler: () => {});

    name: string;
  }

  export class Messenger {
    constructor();

    from(topics: string | [string]): Messenger;
    pickup(readStream: ReadableStream): Messenger;
    pass(station: Station): Messenger;
    deliver(writeStream: WritableStream): void;
    to(topics: string | [string]): void;
  }

  export default Messenger;
}
