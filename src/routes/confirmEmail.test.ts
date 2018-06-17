import fetch from "node-fetch";

test("Sends invalid key back if bad key.", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/120983`);
  const text = await response.text();
  expect(text).toEqual("invalid");
});
