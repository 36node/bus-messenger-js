import { KafkaConsumer, Producer } from "node-rdkafka";
import { ObjectReadableMock, ObjectWritableMock } from "stream-mock";
import { range } from "lodash";

import Messenger from "./index";
import { TBoxStation } from "./station";

const messenger = new Messenger({
  "metadata.broker.list": "localhost:9092",
  "group.id": "librd-test",
});

function wrapKafkaData(count) {
  return range(count).map(index => {
    const data = {
      level: 30,
      time: 1547609017534,
      msg: "handle tbox data success",
      pid: 15,
      hostname: "d28b0b3c862c-shanghaibus-v0-bus32960-1",
      session: "OGKFvtVEqN",
      seq: index,
      partial: false,
      cost: 1,
      data: "ffffffffffff",
      request: {
        command: "REISSUE_REPORT",
        flag: "COMMAND",
        vin: "LZYTBGCW6J1044486",
        encrypt: "NONE",
        length: 267,
        body: {
          at: "2019-01-16T03:23:28.000Z",
          adas: {
            type: "ADAS",
            datas: [
              {
                accPedal: 0,
                brake: 0.15,
                speed: 36,
                totalCurrent: -9,
                overSpeed: 0,
                lateralDistance: 0.7,
                verticalDistance: 93,
                relativeVelocity: -10,
                wheelWarning: false,
                buzzerWarning: false,
                pWarning: false,
                rWarning: false,
                lWarning: false,
                cWarning: false,
                cmcsLevel: 0,
                cmcs: "CLOSE",
                crbs: false,
                reserved: 0,
                obstacleType: "VEHICLE",
              },
            ],
          },
        },
      },
      response:
        "232303014c5a595442474357364a313034343438360100061301100b171c4a",
      v: 1,
    };

    return {
      value: Buffer.from(JSON.stringify(data)),
      topic: "out",
    };
  });
}

describe("## Bus Messenger SDK", () => {
  it("should receive tbox data", done => {
    const input = wrapKafkaData(1);
    const reader = new ObjectReadableMock(input);
    const writer = new ObjectWritableMock();
    reader.consumer = { on: jest.fn() };
    KafkaConsumer.createReadStream = jest.fn(() => reader);
    Producer.createWriteStream = jest.fn(() => writer);

    const tbox = new TBoxStation((data, push) => {
      push(data);
    });

    messenger
      .from("in")
      .pass(tbox)
      .to("out");

    writer.on("finish", () => {
      expect(writer.data).toEqual(input);
      done();
    });
  });
});
