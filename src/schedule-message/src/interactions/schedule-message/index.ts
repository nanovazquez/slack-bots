import { View } from "@slack/bolt";
import {
  buildCheckboxBlock,
  buildDatetimePickerBlock,
  buildPlainTextInputBlock,
  buildMultiConversationsSelectBlock,
} from "~/messageBlocksUtils";
import type {
  SlackCommandListener,
  SlackInteraction,
  SlackMessageListener,
  SlackViewListener,
} from "~/types";

const botUserId = process.env.SLACK_BOT_USER_ID;

const name = "schedule-message";
const description = "Schedules a message to be sent at a later time";
const pattern = /^(.*)( in | at | next | tomorrow)(.*)$/i;

// /schedule hey team tomorrow
// /schedule here's the Zoom link at 2pm
// /schedule how did the meeting go in 3 hours
// /schedule what are your goals this month? next month
// /schedule hello in 5 minutes
// /schedule hello in 2 days
// /schedule hello in 5 weeks
// /schedule hello in 2 months
// /schedule hello at 2pm
// /schedule hello at 1205
// /schedule hello next week
// /schedule hello tomorrow

const shortcutId = "/schedule-message";
const viewId = "schedule-message-modal";

const slashShortcutListener: SlackCommandListener = async ({
  ack,
  client,
  command,
  respond,
  context,
}) => {
  await ack();

  const schedulerUserId = command.user_id;
  const messageToSchedule = command.text;
  const triggerId = command.trigger_id;

  // Open a modal
  await client.views.open({
    trigger_id: triggerId,
    view: buildScheduleMessageModal(schedulerUserId, messageToSchedule),
  });
};

function buildScheduleMessageModal(userId: string, messageToSchedule: string): View {
  return {
    type: "modal",
    callback_id: viewId,
    title: { type: "plain_text", text: "Compose message" },
    submit: { type: "plain_text", text: "Schedule" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      buildPlainTextInputBlock("Write your message", "message", true, messageToSchedule),
      buildMultiConversationsSelectBlock("Conversation", "conversations", [userId]),
      buildDatetimePickerBlock("Date", "date"),
      buildCheckboxBlock("Repeat message", "Repeat", "repeat"),
    ],
  };
}

const viewListener: SlackViewListener = async ({ ack, body, client, view, context }) => {
  await ack();

  console.log(body);
  console.log(context);
  console.log(view);
  console.log(view.state);
};

const scheduleMessageInteraction: SlackInteraction = {
  name,
  description,
  shortcuts: [
    {
      id: shortcutId,
      listener: slashShortcutListener,
    },
  ],
  views: [
    {
      id: viewId,
      listener: viewListener,
    },
  ],
};

export default scheduleMessageInteraction;
