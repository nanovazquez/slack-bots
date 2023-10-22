import { SlackMessageCommand } from "~/types";

const pattern = /^help$/i;
const name = "help";
const description = "Display help information for using the bot";

const listener = async ({ message, say }: any) => {
  await say(`Hi there! I'm a bot here are my available commands`);
};

const command: SlackMessageCommand = {
  pattern,
  name,
  description,
  listener,
};

export default command;
