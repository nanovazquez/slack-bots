import "dotenv/config";
import { App, LogLevel, MemoryStore } from "@slack/bolt";
import commands from "./commands";
import type { SlackMessageCommand } from "./types";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  convoStore: new MemoryStore(),
  socketMode: process.env.DEBUG === "true",
  logLevel: process.env.DEBUG === "true" ? LogLevel.DEBUG : LogLevel.INFO,
});

Object.keys(commands as Record<string, SlackMessageCommand>).forEach((key) => {
  const command: SlackMessageCommand = (commands as Record<string, SlackMessageCommand>)[key];

  console.log(`Setting up command '${command.name}' with pattern ${command.pattern}`);
  app.message(command.pattern, command.listener);

  if (command.actions) {
    command.actions.forEach((action) => {
      console.log(`Setting up action '${action.id}' for command '${command.name}'`);
      app.action(action.id, action.listener);
    });
  }

  if (command.views) {
    command.views.forEach((view) => {
      console.log(`Setting up view '${view.id}' for command '${command.name}'`);
      app.view(view.id, view.listener);
    });
  }
});

(async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.start(port);

  console.log();
  console.log("⚡️ Bolt app is running! in port", port);
  console.log();
})();
