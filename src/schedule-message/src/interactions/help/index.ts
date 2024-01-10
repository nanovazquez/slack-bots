import { SlackInteraction } from "~/types";

const name = "help";
const description = "Display help information for using the bot";

const messagePattern = /^help$/i;
const messageListener = async ({ message, say }: any) => {
  await say(`Hi there! I'm a bot here are my available commands`);
};

const helpInteraction: SlackInteraction = {
  name,
  description,
  messages: [
    {
      pattern: messagePattern,
      listener: messageListener,
    },
  ],
};

export default helpInteraction;
