type TBoxData = {
  command: string;
  flag: string;
  vin: string;
  encrypt: string;
  length: number;
  body: object;
};

type Push = (data: any) => void;

declare module "@36node/bus-messenger" {
  export class TBoxStation {
    constructor(handler: (data: TBoxData, push: Push) => void);

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
