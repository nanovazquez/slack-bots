import "dotenv/config";

function getSalute() {
  return process.env.HELLO;
}

console.log("hi", getSalute());

export { getSalute };
