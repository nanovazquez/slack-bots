import { getSalute } from "../src/index";

test("Initial test", () => {
  const result = getSalute();
  expect(result).not.toBeUndefined();
  expect(result).toEqual(process.env.HELLO);
});
