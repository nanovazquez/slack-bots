import {
  Middleware,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from "@slack/bolt";

export type SlackMessageListener = Middleware<SlackEventMiddlewareArgs<"message">>;
export type SlackCommandListener = Middleware<SlackCommandMiddlewareArgs>;
export type SlackActionListener = Middleware<SlackActionMiddlewareArgs<SlackAction>>;
export type SlackViewListener = Middleware<SlackViewMiddlewareArgs<SlackViewAction>>;

export type SlackInteraction = {
  name: string;
  description: string;
  messages?: {
    pattern: RegExp;
    listener: SlackMessageListener;
  }[];
  shortcuts?: {
    id: string;
    listener: SlackCommandListener;
  }[];
  actions?: {
    id: string;
    listener: SlackActionListener;
  }[];
  views?: {
    id: string;
    listener: SlackViewListener;
  }[];
};
