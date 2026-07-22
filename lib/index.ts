import HtypReadableStream from "./helpers/HtypReadableStream";

(async () => {
  const stream = new HtypReadableStream();

  await stream.read((reader, value) => {
    console.log(value);
  });

  console.log(stream.isConsumed);
})();
