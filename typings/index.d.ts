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

type ExceptionData = {
  ns: string;
  at: Date;
  type: number; // 0x00 ~ 0x80 是报警， 0xa0 ~ 0xff 是异常  通过预定义好的 type 来区分报警和异常
  code: number;
  level: number;
  line: string;
  plate: string;
  vehicle: string;
  vehicleModel: string;
  vehicleModelBrief: string;
  vehicleNo: string;
  vehicleMileage: number;
  vehilceExpiredAt: Date;
};

type Push = (data: any) => void;

declare module "@36node/bus-messenger" {
  export class TBoxStation extends Station {
    constructor(handler: (data: TBoxData, push: Push) => void);

    name: string;
  }

  export class ExceptionStation extends Station {
    constructor(handler: (data: ExceptionData, push: Push) => void);

    name: string;
  }

  export class Station {
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
