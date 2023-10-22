import {
  Middleware,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from "@slack/bolt";

export interface SlackMessageCommand {
  pattern: RegExp;
  name: string;
  description: string;
  listener: Middleware<SlackEventMiddlewareArgs<"message">>;
  actions?: {
    id: string;
    listener: Middleware<SlackActionMiddlewareArgs<SlackAction>>;
  }[];
  views?: {
    id: string;
    listener: Middleware<SlackViewMiddlewareArgs<SlackViewAction>>;
  }[];
}
