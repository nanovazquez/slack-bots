import { SlackMessageCommand } from "~/types";

const pattern = /^hello$/i;
const name = "schedule-message";
const description = "Schedule a message to be sent at a later time";

const listener = async ({ message, say }: any) => {
  const user = !message.subtype ? message.user : "stranger";
  await say(
    `Hi ${user}! I'm a bot that can help you schedule messages to be sent at a later time.`,
  );
};

const command: SlackMessageCommand = {
  pattern,
  name,
  description,
  listener,
};

export default command;
