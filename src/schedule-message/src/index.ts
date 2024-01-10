import "dotenv/config";
import { App, LogLevel, MemoryStore } from "@slack/bolt";
import interactions from "./interactions";
import type { SlackInteraction } from "./types";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  convoStore: new MemoryStore(),
  socketMode: process.env.DEBUG === "true",
  logLevel: process.env.DEBUG === "true" ? LogLevel.DEBUG : LogLevel.INFO,
});

console.log();

Object.keys(interactions).forEach((key: string) => {
  const interaction = (interactions as Record<string, SlackInteraction>)[key];

  console.log(`Setting up interaction '${interaction.name}'..`);

  if (interaction.messages) {
    interaction.messages.forEach((message) => {
      console.log(`Setting up listener for message pattern '${message.pattern}'`);
      app.message(message.pattern, message.listener);
    });
  }

  if (interaction.shortcuts) {
    interaction.shortcuts.forEach((shortcut) => {
      console.log(`Setting up listener for shortcut '${shortcut.id}'`);
      app.command(shortcut.id, shortcut.listener);
    });
  }

  if (interaction.actions) {
    interaction.actions.forEach((action) => {
      console.log(`Setting up listener for action '${action.id}'`);
      app.action(action.id, action.listener);
    });
  }

  if (interaction.views) {
    interaction.views.forEach((view) => {
      console.log(`Setting up listener for view '${view.id}'`);
      app.view(view.id, view.listener);
    });
  }

  console.log(`Setting up interaction '${interaction.name}' done!`);
  console.log();
});

(async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.start(port);

  console.log();
  console.log("⚡️ Bolt app is running! in port", port);
  console.log();
})();
