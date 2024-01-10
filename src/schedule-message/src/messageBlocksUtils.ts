import type {
  ActionsBlock,
  BlockAction,
  BlockElementAction,
  ButtonAction,
  InputBlock,
  KnownBlock,
  MrkdwnElement,
  UsersSelect,
  MultiUsersSelect,
  PlainTextOption,
  SectionBlock,
  SlackAction,
  ViewOutput,
  ConversationsSelect,
  MultiConversationsSelect,
  DateTimepicker,
  StaticSelect,
  Checkboxes,
  Datepicker,
  EmailInput,
  MultiSelect,
  NumberInput,
  PlainTextInput,
  RadioButtons,
  RichTextInput,
  Select,
  Timepicker,
  URLInput,
  Button,
} from "@slack/bolt";

function buildSectionBlockWithLabel(text: string, fieldId = ""): SectionBlock {
  return {
    type: "section",
    block_id: fieldId,
    text: {
      type: "mrkdwn",
      text: text,
    },
  };
}

function buildSectionBlockWithLabels(...labelsText: string[]): SectionBlock {
  return {
    type: "section",
    fields: labelsText.map((item) => ({
      type: "mrkdwn",
      text: item,
    })),
  };
}

function buildInputBlock(
  title: string,
  element:
    | Select
    | MultiSelect
    | Datepicker
    | Timepicker
    | DateTimepicker
    | PlainTextInput
    | URLInput
    | EmailInput
    | NumberInput
    | RadioButtons
    | Checkboxes
    | RichTextInput,
  optional?: boolean,
): InputBlock {
  // By default, only checkboxes are optional
  const isOptional = optional || element.type === "checkboxes";

  return {
    type: "input",
    element: element,
    optional: isOptional,
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildPlainTextInputBlock(
  title: string,
  fieldId: string,
  multiline = false,
  value?: string,
): InputBlock {
  const element: PlainTextInput = {
    type: "plain_text_input",
    multiline: multiline,
    action_id: fieldId,
    initial_value: value,
    min_length: 1,
  };

  return buildInputBlock(title, element);
}

function buildCheckboxBlock(title: string, text: string, fieldId: string): InputBlock {
  const element: Checkboxes = {
    type: "checkboxes",
    action_id: fieldId,
    options: [
      {
        text: {
          type: "plain_text",
          text: text,
          emoji: true,
        },
        value: fieldId,
      },
    ],
  };

  return buildInputBlock(title, element);
}

function buildDatetimePickerBlock(title: string, fieldId: string, value?: number): InputBlock {
  const element: DateTimepicker = {
    type: "datetimepicker",
    action_id: fieldId,
    initial_date_time: value,
  };

  return buildInputBlock(title, element);
}

function buildStaticSelectBlock(
  title: string,
  fieldId: string,
  values: { text: string; value: string }[],
  selectedValue?: string,
): InputBlock {
  const options: PlainTextOption[] = values.map((item) => ({
    text: { type: "plain_text", text: item.text },
    value: item.value,
  }));
  const selectedOption = options.find((option) => option.value === selectedValue);

  const element: StaticSelect = {
    type: "static_select",
    action_id: fieldId,
    options: options,
    initial_option: selectedOption,
  };

  return buildInputBlock(title, element);
}

function buildUsersSelectBlock(title: string, fieldId: string, value?: string): InputBlock {
  const element: UsersSelect = {
    type: "users_select",
    action_id: fieldId,
    initial_user: value,
  };

  return buildInputBlock(title, element);
}

function buildMultiUsersSelectBlock(title: string, fieldId: string, value?: string[]): InputBlock {
  const element: MultiUsersSelect = {
    type: "multi_users_select",
    action_id: fieldId,
    initial_users: value,
  };

  return buildInputBlock(title, element);
}

function buildConversationsSelectBlock(title: string, fieldId: string, value?: string): InputBlock {
  const element: ConversationsSelect = {
    type: "conversations_select",
    action_id: fieldId,
    default_to_current_conversation: true,
    initial_conversation: value,
  };

  return buildInputBlock(title, element);
}

function buildMultiConversationsSelectBlock(
  title: string,
  fieldId: string,
  value?: string[],
): InputBlock {
  const element: MultiConversationsSelect = {
    type: "multi_conversations_select",
    action_id: fieldId,
    default_to_current_conversation: true,
    initial_conversations: value,
  };

  return buildInputBlock(title, element);
}

function buildButtonsBlock(
  buttonsInfo: { fieldId: string; text: string; style?: "danger" | "primary"; value?: string }[],
): ActionsBlock {
  const elements: Button[] = buttonsInfo.map((info) => ({
    type: "button",
    text: {
      type: "plain_text",
      emoji: true,
      text: info.text,
    },
    style: info.style,
    action_id: info.fieldId,
    value: info.value,
  }));

  return {
    type: "actions",
    elements: elements,
  };
}

/**
 * Updates the message blocks with the current block values (entered by the user)
 * but adds a message block at the end with the message to be sent.
 * This is used to provide feedback to the user (e.g. when there are validation errors)
 * @param body The body of the action
 * @param message The message to be sent
 * @returns The current blocks with their current values, plus a new message to be displayed
 */
function buildSameBlocksWithMessage(body: SlackAction, message: string): KnownBlock[] {
  const currentBlocks: KnownBlock[] = (body as any).message.blocks;
  const messageBlock = currentBlocks.find((item) => item.block_id === "messageBlock");

  if (messageBlock) {
    ((messageBlock as SectionBlock).text as MrkdwnElement).text = message;
    return currentBlocks;
  }

  return [...currentBlocks, buildSectionBlockWithLabel(message, "messageBlock")];
}

function getFieldValueFromActionBody<T = string>(fieldId: string, body: ViewOutput): T {
  for (const key in body.state.values) {
    const value =
      body.state.values[key][fieldId] &&
      (body.state.values[key][fieldId].value ||
        body.state.values[key][fieldId].selected_user ||
        body.state.values[key][fieldId].selected_users ||
        body.state.values[key][fieldId].selected_date ||
        body.state.values[key][fieldId].selected_time ||
        body.state.values[key][fieldId].selected_option?.value);

    if (value) {
      return value as unknown as T;
    }
  }

  return "" as unknown as T;
}

function getFieldValueFromButton<T = string>(fieldId: string, body: BlockAction): T {
  const actions: BlockElementAction[] = body.actions;
  const value = (actions.find((action) => action.action_id === fieldId) as ButtonAction).value;
  if (value) {
    return value as unknown as T;
  }
  return "" as unknown as T;
}

export {
  buildSectionBlockWithLabel,
  buildSectionBlockWithLabels,
  buildInputBlock,
  buildPlainTextInputBlock,
  buildCheckboxBlock,
  buildDatetimePickerBlock,
  buildStaticSelectBlock,
  buildUsersSelectBlock,
  buildMultiUsersSelectBlock,
  buildConversationsSelectBlock,
  buildMultiConversationsSelectBlock,
  buildButtonsBlock,
  buildSameBlocksWithMessage,
  getFieldValueFromActionBody,
  getFieldValueFromButton,
};
