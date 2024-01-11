import { View } from "@slack/bolt";
import {
  buildCheckboxBlock,
  buildDatetimePickerBlock,
  buildPlainTextInputBlock,
  buildMultiConversationsSelectBlock,
  getFieldValueFromView,
  buildRadioButtonsBlock,
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
      buildRadioButtonsBlock("Repeat message", "repeat", [
        { text: "Do not repeat", value: "never", selected: true },
        { text: "Daily", value: "daily" },
        { text: "Weekly", value: "weekly" },
        { text: "Monthly", value: "monthly" },
        { text: "Every weekday (Monday to Friday)", value: "weekday" },
        // { text: "Custom", value: "custom" },
      ]),
    ],
  };
}

const viewListener: SlackViewListener = async ({ ack, body, client, view, context }) => {
  await ack();

  const messageValues = {
    message: getFieldValueFromView("message", view),
    conversations: getFieldValueFromView("conversations", view),
    date: getFieldValueFromView("date", view),
    repeat: getFieldValueFromView("repeat", view),
  };

  // Send a message to the user that the message is being scheduled

  console.log(messageValues);

  // Schedule the message based on the values received
  const scheduledMessage = await client.chat.scheduleMessage({
    channel: messageValues.conversations[0],
    text: messageValues.message,
    post_at: messageValues.date,
    as_user: true,
  });

  // Notify the user that the message was scheduled
  console.log(scheduledMessage);
  console.log(
    `Message for user ${body.user.name} was scheduled for ${scheduledMessage.post_at} with the id ${scheduledMessage.scheduled_message_id}`,
  );
  await client.chat.postMessage({
    channel: messageValues.conversations[0],
    text: `Your message was scheduled for ${scheduledMessage.post_at} with the id ${scheduledMessage.scheduled_message_id}`,
    thread_ts: scheduledMessage.scheduled_message_id,
  });
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
