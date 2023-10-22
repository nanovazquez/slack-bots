import type {
  ActionsBlock,
  BlockAction,
  BlockElementAction,
  ButtonAction,
  InputBlock,
  KnownBlock,
  MrkdwnElement,
  Option,
  PlainTextOption,
  SectionBlock,
  SlackAction,
  ViewOutput,
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

function buildSectionBlockWithFields(...fieldsText: string[]): SectionBlock {
  return {
    type: "section",
    fields: fieldsText.map((item) => ({
      type: "mrkdwn",
      text: item,
    })),
  };
}

function buildTextInputBlock(
  fieldId: string,
  title: string,
  multiline = false,
  value?: string,
  placeholder_text?: string,
): InputBlock {
  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "plain_text_input",
      multiline: multiline,
      action_id: fieldId,
      initial_value: value,
      placeholder: {
        type: "plain_text",
        text: placeholder_text ? placeholder_text : "Agregar un texto",
        emoji: true,
      },
      min_length: 1,
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildDatePicker(
  fieldId: string,
  title: string,
  value?: string,
  placeholder_text?: string,
): InputBlock {
  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "datepicker",
      placeholder: {
        type: "plain_text",
        text: placeholder_text ? placeholder_text : "Elegir una fecha de envío del mensaje",
        emoji: true,
      },
      action_id: fieldId,
      initial_date: value,
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildTimePicker(
  fieldId: string,
  title: string,
  value?: string,
  placeholder_text?: string,
): InputBlock {
  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "timepicker",
      placeholder: {
        type: "plain_text",
        text: placeholder_text ? placeholder_text : "Elegir una hora de envío del mensaje",
        emoji: true,
      },
      action_id: fieldId,
      initial_time: value,
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildStaticSelectBlock(
  fieldId: string,
  title: string,
  optionValues: { text: string; value: string }[],
  selectedOptionValue?: string,
  placeholder?: string,
): InputBlock {
  const options: Option[] = optionValues.map((optionValue) => ({
    text: {
      type: "plain_text",
      text: optionValue.text,
    },
    value: optionValue.value,
  }));
  const selectedOption = options.find((option) => option.value === selectedOptionValue);

  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: placeholder || "",
        emoji: true,
      },
      options: options as PlainTextOption[],
      initial_option: selectedOption as PlainTextOption,
      action_id: fieldId,
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildUserSelectBlock(
  fieldId: string,
  title: string,
  value?: string,
  placeholder?: string,
): InputBlock {
  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "users_select",
      placeholder: {
        type: "plain_text",
        text: placeholder || "Seleccioná un usuario",
        emoji: true,
      },
      action_id: fieldId,
      initial_user: value || "-1",
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildMultiUsersSelect(
  fieldId: string,
  title: string,
  value: string[] = [],
  placeholder_text?: string,
): InputBlock {
  return {
    type: "input",
    block_id: fieldId,
    element: {
      type: "multi_users_select",
      placeholder: {
        type: "plain_text",
        text: placeholder_text ? placeholder_text : "Agregar a los usuarios",
        emoji: true,
      },
      action_id: fieldId,
      initial_users: value,
    },
    label: {
      type: "plain_text",
      text: title,
      emoji: true,
    },
  };
}

function buildButtonsBlock(
  buttonsInfo: { fieldId: string; text: string; style?: string; value?: string }[],
): ActionsBlock {
  return {
    type: "actions",
    elements: buttonsInfo.map((info) => ({
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: info.text,
      },
      style: info.style,
      action_id: info.fieldId,
      value: info.value,
    })),
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
  buildSectionBlockWithFields,
  buildTextInputBlock,
  buildStaticSelectBlock,
  buildUserSelectBlock,
  buildMultiUsersSelect,
  buildButtonsBlock,
  buildDatePicker,
  buildTimePicker,
  buildSameBlocksWithMessage,
  getFieldValueFromActionBody,
  getFieldValueFromButton,
};
