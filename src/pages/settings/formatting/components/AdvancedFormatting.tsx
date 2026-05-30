import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Accordion from '../../../../components/common/Accordion/Accordion';
import Button from '../../../../components/common/Button/Button';
import Checkbox from '../../../../components/common/Checkbox/Checkbox';
import Input from '../../../../components/common/Input/Input';
import Select from '../../../../components/common/Select/Select';
import SectionTitle from './SectionTitle';

type SelectOption = {
  value: string;
  label: string;
};

type AdvancedFormattingMode = 'text' | 'chat';

interface AdvancedFormattingProps {
  mode: AdvancedFormattingMode;
}

const { saveSettingsDebounced } = await imports('@script');

const AdvancedFormatting = ({ mode }: AdvancedFormattingProps) => {
  const isChatCompletion = mode === 'chat';

  const readValue = useCallback((selector: string) => {
    const element = $(selector);
    if (!element.length) return '';
    if (element.is(':checkbox')) {
      return Boolean(element.prop('checked'));
    }
    return String(element.val() ?? '');
  }, []);

  const readOptions = useCallback((selector: string) => {
    const element = $(selector);
    if (!element.length) return [];
    return element
      .find('option')
      .map(function () {
        return {
          value: String($(this).val()),
          label: String($(this).text()),
        };
      })
      .get();
  }, []);

  const getSnapshot = useCallback(() => {
    const nextValues: Record<string, string | boolean> = {
      context_presets: readValue('#context_presets'),
      context_derived: Boolean(readValue('#context_derived')),
      context_story_string: readValue('#context_story_string'),
      context_story_string_position: readValue(
        '#context_story_string_position',
      ),
      context_story_string_depth: readValue('#context_story_string_depth'),
      context_story_string_role: readValue('#context_story_string_role'),
      context_example_separator: readValue('#context_example_separator'),
      context_chat_start: readValue('#context_chat_start'),
      context_use_stop_strings: Boolean(readValue('#context_use_stop_strings')),
      context_names_as_stop_strings: Boolean(
        readValue('#context_names_as_stop_strings'),
      ),
      always_force_name2: Boolean(readValue('#always-force-name2-checkbox')),
      single_line: Boolean(readValue('#single_line')),
      collapse_newlines: Boolean(readValue('#collapse-newlines-checkbox')),
      trim_spaces: Boolean(readValue('#trim_spaces')),
      trim_sentences: Boolean(readValue('#trim_sentences_checkbox')),

      instruct_presets: readValue('#instruct_presets'),
      instruct_derived: Boolean(readValue('#instruct_derived')),
      instruct_bind_to_context: Boolean(readValue('#instruct_bind_to_context')),
      instruct_enabled: Boolean(readValue('#instruct_enabled')),
      instruct_activation_regex: readValue('#instruct_activation_regex'),
      instruct_wrap: Boolean(readValue('#instruct_wrap')),
      instruct_macro: Boolean(readValue('#instruct_macro')),
      instruct_sequences_as_stop_strings: Boolean(
        readValue('#instruct_sequences_as_stop_strings'),
      ),
      instruct_skip_examples: Boolean(readValue('#instruct_skip_examples')),
      instruct_names_behavior: readValue('#instruct_names_behavior'),
      instruct_story_string_prefix: readValue('#instruct_story_string_prefix'),
      instruct_story_string_suffix: readValue('#instruct_story_string_suffix'),
      instruct_input_sequence: readValue('#instruct_input_sequence'),
      instruct_input_suffix: readValue('#instruct_input_suffix'),
      instruct_output_sequence: readValue('#instruct_output_sequence'),
      instruct_output_suffix: readValue('#instruct_output_suffix'),
      instruct_system_sequence: readValue('#instruct_system_sequence'),
      instruct_system_suffix: readValue('#instruct_system_suffix'),
      instruct_system_same_as_user: Boolean(
        readValue('#instruct_system_same_as_user'),
      ),
      instruct_first_output_sequence: readValue(
        '#instruct_first_output_sequence',
      ),
      instruct_last_output_sequence: readValue(
        '#instruct_last_output_sequence',
      ),
      instruct_first_input_sequence: readValue(
        '#instruct_first_input_sequence',
      ),
      instruct_last_input_sequence: readValue('#instruct_last_input_sequence'),
      instruct_last_system_sequence: readValue(
        '#instruct_last_system_sequence',
      ),
      instruct_stop_sequence: readValue('#instruct_stop_sequence'),
      instruct_user_alignment_message: readValue(
        '#instruct_user_alignment_message',
      ),

      sysprompt_enabled: Boolean(readValue('#sysprompt_enabled')),
      sysprompt_select: readValue('#sysprompt_select'),
      sysprompt_content: readValue('#sysprompt_content'),
      sysprompt_post_history: readValue('#sysprompt_post_history'),

      custom_stopping_strings: readValue('#custom_stopping_strings'),
      custom_stopping_strings_macro: Boolean(
        readValue('#custom_stopping_strings_macro'),
      ),

      tokenizer: readValue('#tokenizer'),
      token_padding: readValue('#token_padding'),

      reasoning_auto_parse: Boolean(readValue('#reasoning_auto_parse')),
      reasoning_auto_expand: Boolean(readValue('#reasoning_auto_expand')),
      reasoning_show_hidden: Boolean(readValue('#reasoning_show_hidden')),
      reasoning_add_to_prompts: Boolean(readValue('#reasoning_add_to_prompts')),
      reasoning_max_additions: readValue('#reasoning_max_additions'),
      reasoning_select: readValue('#reasoning_select'),
      reasoning_prefix: readValue('#reasoning_prefix'),
      reasoning_suffix: readValue('#reasoning_suffix'),
      reasoning_separator: readValue('#reasoning_separator'),

      bind_model_templates: Boolean(readValue('#bind_model_templates')),
      markdown_escape_strings: readValue('#markdown_escape_strings'),
      start_reply_with: readValue('#start_reply_with'),
      show_reply_prefix: Boolean(readValue('#chat-show-reply-prefix-checkbox')),
    };

    const nextOptions: Record<string, SelectOption[]> = {
      context_presets: readOptions('#context_presets'),
      context_story_string_position: readOptions(
        '#context_story_string_position',
      ),
      context_story_string_role: readOptions('#context_story_string_role'),
      instruct_presets: readOptions('#instruct_presets'),
      instruct_names_behavior: readOptions('#instruct_names_behavior'),
      sysprompt_select: readOptions('#sysprompt_select'),
      reasoning_select: readOptions('#reasoning_select'),
      tokenizer: readOptions('#tokenizer'),
    };

    return { values: nextValues, options: nextOptions };
  }, [readOptions, readValue]);

  const [values, setValues] = useState<Record<string, string | boolean>>(
    () => getSnapshot().values,
  );
  const [options, setOptions] = useState<Record<string, SelectOption[]>>(
    () => getSnapshot().options,
  );

  const syncFromNativeState = useCallback(() => {
    const snapshot = getSnapshot();
    setValues(snapshot.values);
    setOptions(snapshot.options);
  }, [getSnapshot]);

  useEffect(() => {
    const selectorList = [
      '#context_presets',
      '#context_derived',
      '#context_story_string',
      '#context_story_string_position',
      '#context_story_string_depth',
      '#context_story_string_role',
      '#context_example_separator',
      '#context_chat_start',
      '#context_use_stop_strings',
      '#context_names_as_stop_strings',
      '#always-force-name2-checkbox',
      '#single_line',
      '#collapse-newlines-checkbox',
      '#trim_spaces',
      '#trim_sentences_checkbox',
      '#instruct_presets',
      '#instruct_derived',
      '#instruct_bind_to_context',
      '#instruct_enabled',
      '#instruct_activation_regex',
      '#instruct_wrap',
      '#instruct_macro',
      '#instruct_sequences_as_stop_strings',
      '#instruct_skip_examples',
      '#instruct_names_behavior',
      '#instruct_story_string_prefix',
      '#instruct_story_string_suffix',
      '#instruct_input_sequence',
      '#instruct_input_suffix',
      '#instruct_output_sequence',
      '#instruct_output_suffix',
      '#instruct_system_sequence',
      '#instruct_system_suffix',
      '#instruct_system_same_as_user',
      '#instruct_first_output_sequence',
      '#instruct_last_output_sequence',
      '#instruct_first_input_sequence',
      '#instruct_last_input_sequence',
      '#instruct_last_system_sequence',
      '#instruct_stop_sequence',
      '#instruct_user_alignment_message',
      '#sysprompt_enabled',
      '#sysprompt_select',
      '#sysprompt_content',
      '#sysprompt_post_history',
      '#custom_stopping_strings',
      '#custom_stopping_strings_macro',
      '#tokenizer',
      '#token_padding',
      '#reasoning_auto_parse',
      '#reasoning_auto_expand',
      '#reasoning_show_hidden',
      '#reasoning_add_to_prompts',
      '#reasoning_max_additions',
      '#reasoning_select',
      '#reasoning_prefix',
      '#reasoning_suffix',
      '#reasoning_separator',
      '#bind_model_templates',
      '#markdown_escape_strings',
      '#start_reply_with',
      '#chat-show-reply-prefix-checkbox',
    ].join(', ');

    const handleSync = () => syncFromNativeState();
    $(document).on(
      'input.discordiaFormatting change.discordiaFormatting',
      selectorList,
      handleSync,
    );

    return () => {
      $(document).off('.discordiaFormatting');
    };
  }, [syncFromNativeState]);

  const applyValue = useCallback(
    (key: string, selector: string, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [key]: value }));

      const element = $(selector);
      if (!element.length) return;

      if (element.is(':checkbox')) {
        element.prop('checked', Boolean(value));
      } else {
        element.val(String(value));
      }

      const eventType = element.is('select') ? 'change' : 'input';
      element.trigger(eventType);
      saveSettingsDebounced();
    },
    [],
  );

  const triggerNativeButton = useCallback(
    (selector: string) => {
      const element = $(selector);
      if (!element.length) return;
      element.trigger('click');
      window.setTimeout(syncFromNativeState, 0);
    },
    [syncFromNativeState],
  );

  const renderPresetActions = useCallback(
    (prefix: string, deleteSelector?: string) => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Button
          label="Update"
          onClick={() =>
            triggerNativeButton(`[data-preset-manager-update="${prefix}"]`)
          }
        />
        <Button
          label="Save As"
          onClick={() =>
            triggerNativeButton(`[data-preset-manager-new="${prefix}"]`)
          }
        />
        <Button
          label="Rename"
          onClick={() =>
            triggerNativeButton(`[data-preset-manager-rename="${prefix}"]`)
          }
        />
        <Button
          label="Import"
          onClick={() =>
            triggerNativeButton(`[data-preset-manager-import="${prefix}"]`)
          }
        />
        <Button
          label="Export"
          onClick={() =>
            triggerNativeButton(`[data-preset-manager-export="${prefix}"]`)
          }
        />
        <Button
          label="Delete"
          onClick={() =>
            triggerNativeButton(
              deleteSelector || `[data-preset-manager-delete="${prefix}"]`,
            )
          }
        />
      </div>
    ),
    [triggerNativeButton],
  );

  const contextOptions = options.context_presets ?? [];
  const instructOptions = options.instruct_presets ?? [];
  const syspromptOptions = options.sysprompt_select ?? [];
  const reasoningOptions = options.reasoning_select ?? [];
  const tokenizerOptions = options.tokenizer ?? [];
  const contextPositionOptions = options.context_story_string_position ?? [];
  const contextRoleOptions = options.context_story_string_role ?? [];
  const instructNameOptions = options.instruct_names_behavior ?? [];

  const enableSystemPrompt = Boolean(values.sysprompt_enabled);

  const warningNotice = useMemo(() => {
    if (!isChatCompletion) return null;
    return (
      <div className="rounded border border-yellow-600/70 bg-yellow-900/20 p-3 text-sm text-yellow-200">
        Some advanced formatting options are only available for text completion
        APIs.
      </div>
    );
  }, [isChatCompletion]);

  return (
    <div className="flex flex-col gap-4">
      {warningNotice}

      {!isChatCompletion && (
        <Accordion title="Context Template" isOpen={true}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Select
                options={contextOptions}
                value={String(values.context_presets ?? '')}
                onChange={(value) =>
                  applyValue(
                    'context_presets',
                    '#context_presets',
                    String(value),
                  )
                }
              />
              {renderPresetActions('context', '#context_delete_preset')}
            </div>

            <Checkbox
              label="Derive from model metadata"
              checked={Boolean(values.context_derived)}
              onChange={(value) =>
                applyValue('context_derived', '#context_derived', value)
              }
            />

            <Input
              label="Story String"
              growHeight
              maxHeight={240}
              value={String(values.context_story_string ?? '')}
              onChange={(value) =>
                applyValue(
                  'context_story_string',
                  '#context_story_string',
                  value,
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Position</label>
                <Select
                  options={contextPositionOptions}
                  value={String(values.context_story_string_position ?? '')}
                  onChange={(value) =>
                    applyValue(
                      'context_story_string_position',
                      '#context_story_string_position',
                      String(value),
                    )
                  }
                />
              </div>
              <Input
                label="Depth"
                type="number"
                value={String(values.context_story_string_depth ?? '')}
                onChange={(value) =>
                  applyValue(
                    'context_story_string_depth',
                    '#context_story_string_depth',
                    value,
                  )
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Role</label>
                <Select
                  options={contextRoleOptions}
                  value={String(values.context_story_string_role ?? '')}
                  onChange={(value) =>
                    applyValue(
                      'context_story_string_role',
                      '#context_story_string_role',
                      String(value),
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Example Separator"
                growHeight
                maxHeight={180}
                value={String(values.context_example_separator ?? '')}
                onChange={(value) =>
                  applyValue(
                    'context_example_separator',
                    '#context_example_separator',
                    value,
                  )
                }
              />
              <Input
                label="Chat Start"
                growHeight
                maxHeight={180}
                value={String(values.context_chat_start ?? '')}
                onChange={(value) =>
                  applyValue('context_chat_start', '#context_chat_start', value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Checkbox
                label="Always add character name"
                checked={Boolean(values.always_force_name2)}
                onChange={(value) =>
                  applyValue(
                    'always_force_name2',
                    '#always-force-name2-checkbox',
                    value,
                  )
                }
              />
              <Checkbox
                label="Generate one line only"
                checked={Boolean(values.single_line)}
                onChange={(value) =>
                  applyValue('single_line', '#single_line', value)
                }
              />
              <Checkbox
                label="Collapse consecutive newlines"
                checked={Boolean(values.collapse_newlines)}
                onChange={(value) =>
                  applyValue(
                    'collapse_newlines',
                    '#collapse-newlines-checkbox',
                    value,
                  )
                }
              />
              <Checkbox
                label="Trim spaces"
                checked={Boolean(values.trim_spaces)}
                onChange={(value) =>
                  applyValue('trim_spaces', '#trim_spaces', value)
                }
              />
              <Checkbox
                label="Trim incomplete sentences"
                checked={Boolean(values.trim_sentences)}
                onChange={(value) =>
                  applyValue(
                    'trim_sentences',
                    '#trim_sentences_checkbox',
                    value,
                  )
                }
              />
              <Checkbox
                label="Separators as stop strings"
                checked={Boolean(values.context_use_stop_strings)}
                onChange={(value) =>
                  applyValue(
                    'context_use_stop_strings',
                    '#context_use_stop_strings',
                    value,
                  )
                }
              />
              <Checkbox
                label="Names as stop strings"
                checked={Boolean(values.context_names_as_stop_strings)}
                onChange={(value) =>
                  applyValue(
                    'context_names_as_stop_strings',
                    '#context_names_as_stop_strings',
                    value,
                  )
                }
              />
            </div>
          </div>
        </Accordion>
      )}

      {!isChatCompletion && (
        <Accordion title="Instruct Template" isOpen={true}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Select
                options={instructOptions}
                value={String(values.instruct_presets ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_presets',
                    '#instruct_presets',
                    String(value),
                  )
                }
              />
              {renderPresetActions('instruct')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Checkbox
                label="Derive from model metadata"
                checked={Boolean(values.instruct_derived)}
                onChange={(value) =>
                  applyValue('instruct_derived', '#instruct_derived', value)
                }
              />
              <Checkbox
                label="Bind to context"
                checked={Boolean(values.instruct_bind_to_context)}
                onChange={(value) =>
                  applyValue(
                    'instruct_bind_to_context',
                    '#instruct_bind_to_context',
                    value,
                  )
                }
              />
              <Checkbox
                label="Enable instruct mode"
                checked={Boolean(values.instruct_enabled)}
                onChange={(value) =>
                  applyValue('instruct_enabled', '#instruct_enabled', value)
                }
              />
            </div>

            <Input
              label="Activation Regex"
              value={String(values.instruct_activation_regex ?? '')}
              onChange={(value) =>
                applyValue(
                  'instruct_activation_regex',
                  '#instruct_activation_regex',
                  value,
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Checkbox
                label="Wrap sequences with newline"
                checked={Boolean(values.instruct_wrap)}
                onChange={(value) =>
                  applyValue('instruct_wrap', '#instruct_wrap', value)
                }
              />
              <Checkbox
                label="Replace macro in sequences"
                checked={Boolean(values.instruct_macro)}
                onChange={(value) =>
                  applyValue('instruct_macro', '#instruct_macro', value)
                }
              />
              <Checkbox
                label="Sequences as stop strings"
                checked={Boolean(values.instruct_sequences_as_stop_strings)}
                onChange={(value) =>
                  applyValue(
                    'instruct_sequences_as_stop_strings',
                    '#instruct_sequences_as_stop_strings',
                    value,
                  )
                }
              />
              <Checkbox
                label="Skip example dialogues"
                checked={Boolean(values.instruct_skip_examples)}
                onChange={(value) =>
                  applyValue(
                    'instruct_skip_examples',
                    '#instruct_skip_examples',
                    value,
                  )
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Include Names</label>
              <Select
                options={instructNameOptions}
                value={String(values.instruct_names_behavior ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_names_behavior',
                    '#instruct_names_behavior',
                    String(value),
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Story String Prefix"
                growHeight
                value={String(values.instruct_story_string_prefix ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_story_string_prefix',
                    '#instruct_story_string_prefix',
                    value,
                  )
                }
              />
              <Input
                label="Story String Suffix"
                growHeight
                value={String(values.instruct_story_string_suffix ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_story_string_suffix',
                    '#instruct_story_string_suffix',
                    value,
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="User Message Prefix"
                growHeight
                value={String(values.instruct_input_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_input_sequence',
                    '#instruct_input_sequence',
                    value,
                  )
                }
              />
              <Input
                label="User Message Suffix"
                growHeight
                value={String(values.instruct_input_suffix ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_input_suffix',
                    '#instruct_input_suffix',
                    value,
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Assistant Message Prefix"
                growHeight
                value={String(values.instruct_output_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_output_sequence',
                    '#instruct_output_sequence',
                    value,
                  )
                }
              />
              <Input
                label="Assistant Message Suffix"
                growHeight
                value={String(values.instruct_output_suffix ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_output_suffix',
                    '#instruct_output_suffix',
                    value,
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="System Message Prefix"
                growHeight
                value={String(values.instruct_system_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_system_sequence',
                    '#instruct_system_sequence',
                    value,
                  )
                }
              />
              <Input
                label="System Message Suffix"
                growHeight
                value={String(values.instruct_system_suffix ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_system_suffix',
                    '#instruct_system_suffix',
                    value,
                  )
                }
              />
            </div>

            <Checkbox
              label="System sequences same as user"
              checked={Boolean(values.instruct_system_same_as_user)}
              onChange={(value) =>
                applyValue(
                  'instruct_system_same_as_user',
                  '#instruct_system_same_as_user',
                  value,
                )
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="First Assistant Prefix"
                growHeight
                value={String(values.instruct_first_output_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_first_output_sequence',
                    '#instruct_first_output_sequence',
                    value,
                  )
                }
              />
              <Input
                label="Last Assistant Prefix"
                growHeight
                value={String(values.instruct_last_output_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_last_output_sequence',
                    '#instruct_last_output_sequence',
                    value,
                  )
                }
              />
              <Input
                label="First User Prefix"
                growHeight
                value={String(values.instruct_first_input_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_first_input_sequence',
                    '#instruct_first_input_sequence',
                    value,
                  )
                }
              />
              <Input
                label="Last User Prefix"
                growHeight
                value={String(values.instruct_last_input_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_last_input_sequence',
                    '#instruct_last_input_sequence',
                    value,
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="System Instruction Prefix"
                growHeight
                value={String(values.instruct_last_system_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_last_system_sequence',
                    '#instruct_last_system_sequence',
                    value,
                  )
                }
              />
              <Input
                label="Stop Sequence"
                growHeight
                value={String(values.instruct_stop_sequence ?? '')}
                onChange={(value) =>
                  applyValue(
                    'instruct_stop_sequence',
                    '#instruct_stop_sequence',
                    value,
                  )
                }
              />
            </div>

            <Input
              label="User Filler Message"
              growHeight
              value={String(values.instruct_user_alignment_message ?? '')}
              onChange={(value) =>
                applyValue(
                  'instruct_user_alignment_message',
                  '#instruct_user_alignment_message',
                  value,
                )
              }
            />
          </div>
        </Accordion>
      )}

      <Accordion
        title={
          <SectionTitle
            title="System Prompt"
            enabled={enableSystemPrompt}
            onClick={() =>
              applyValue(
                'sysprompt_enabled',
                '#sysprompt_enabled',
                !enableSystemPrompt,
              )
            }
          />
        }
        isOpen={true}
      >
        <div className="flex flex-col gap-4">
          <Select
            options={syspromptOptions}
            value={String(values.sysprompt_select ?? '')}
            onChange={(value) =>
              applyValue('sysprompt_select', '#sysprompt_select', String(value))
            }
          />
          {renderPresetActions('sysprompt')}
          <Input
            label="Prompt Content"
            growHeight
            maxHeight={300}
            value={String(values.sysprompt_content ?? '')}
            onChange={(value) =>
              applyValue('sysprompt_content', '#sysprompt_content', value)
            }
          />
          <Input
            label="Post-History Instructions"
            growHeight
            maxHeight={300}
            value={String(values.sysprompt_post_history ?? '')}
            onChange={(value) =>
              applyValue(
                'sysprompt_post_history',
                '#sysprompt_post_history',
                value,
              )
            }
          />
        </div>
      </Accordion>

      <Accordion title="Custom Stopping Strings" isOpen={false}>
        <div className="flex flex-col gap-3">
          <Input
            label="JSON array"
            growHeight
            maxHeight={180}
            value={String(values.custom_stopping_strings ?? '')}
            onChange={(value) =>
              applyValue(
                'custom_stopping_strings',
                '#custom_stopping_strings',
                value,
              )
            }
          />
          <Checkbox
            label="Replace macro in stop strings"
            checked={Boolean(values.custom_stopping_strings_macro)}
            onChange={(value) =>
              applyValue(
                'custom_stopping_strings_macro',
                '#custom_stopping_strings_macro',
                value,
              )
            }
          />
        </div>
      </Accordion>

      <Accordion title="Tokenizer" isOpen={false}>
        <div className="flex flex-col gap-3">
          <Select
            options={tokenizerOptions}
            value={String(values.tokenizer ?? '')}
            onChange={(value) =>
              applyValue('tokenizer', '#tokenizer', String(value))
            }
          />
          <Input
            label="Token Padding"
            type="number"
            value={String(values.token_padding ?? '')}
            onChange={(value) =>
              applyValue('token_padding', '#token_padding', value)
            }
          />
        </div>
      </Accordion>

      <Accordion title="Reasoning" isOpen={false}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Checkbox
              label="Auto-parse"
              checked={Boolean(values.reasoning_auto_parse)}
              onChange={(value) =>
                applyValue(
                  'reasoning_auto_parse',
                  '#reasoning_auto_parse',
                  value,
                )
              }
            />
            <Checkbox
              label="Auto-expand"
              checked={Boolean(values.reasoning_auto_expand)}
              onChange={(value) =>
                applyValue(
                  'reasoning_auto_expand',
                  '#reasoning_auto_expand',
                  value,
                )
              }
            />
            <Checkbox
              label="Show hidden"
              checked={Boolean(values.reasoning_show_hidden)}
              onChange={(value) =>
                applyValue(
                  'reasoning_show_hidden',
                  '#reasoning_show_hidden',
                  value,
                )
              }
            />
            <Checkbox
              label="Add to prompts"
              checked={Boolean(values.reasoning_add_to_prompts)}
              onChange={(value) =>
                applyValue(
                  'reasoning_add_to_prompts',
                  '#reasoning_add_to_prompts',
                  value,
                )
              }
            />
          </div>

          <Input
            label="Max additions"
            type="number"
            value={String(values.reasoning_max_additions ?? '')}
            onChange={(value) =>
              applyValue(
                'reasoning_max_additions',
                '#reasoning_max_additions',
                value,
              )
            }
          />

          <div className="flex flex-col gap-2">
            <Select
              options={reasoningOptions}
              value={String(values.reasoning_select ?? '')}
              onChange={(value) =>
                applyValue(
                  'reasoning_select',
                  '#reasoning_select',
                  String(value),
                )
              }
            />
            {renderPresetActions('reasoning')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Prefix"
              growHeight
              value={String(values.reasoning_prefix ?? '')}
              onChange={(value) =>
                applyValue('reasoning_prefix', '#reasoning_prefix', value)
              }
            />
            <Input
              label="Suffix"
              growHeight
              value={String(values.reasoning_suffix ?? '')}
              onChange={(value) =>
                applyValue('reasoning_suffix', '#reasoning_suffix', value)
              }
            />
          </div>

          <Input
            label="Separator"
            growHeight
            value={String(values.reasoning_separator ?? '')}
            onChange={(value) =>
              applyValue('reasoning_separator', '#reasoning_separator', value)
            }
          />
        </div>
      </Accordion>

      <Accordion title="Miscellaneous" isOpen={false}>
        <div className="flex flex-col gap-3">
          <Checkbox
            label="Bind model to templates"
            checked={Boolean(values.bind_model_templates)}
            onChange={(value) =>
              applyValue('bind_model_templates', '#bind_model_templates', value)
            }
          />
          <Input
            label="Non-markdown strings"
            value={String(values.markdown_escape_strings ?? '')}
            onChange={(value) =>
              applyValue(
                'markdown_escape_strings',
                '#markdown_escape_strings',
                value,
              )
            }
          />
          <Input
            label="Start reply with"
            growHeight
            value={String(values.start_reply_with ?? '')}
            onChange={(value) =>
              applyValue('start_reply_with', '#start_reply_with', value)
            }
          />
          <Checkbox
            label="Show reply prefix in chat"
            checked={Boolean(values.show_reply_prefix)}
            onChange={(value) =>
              applyValue(
                'show_reply_prefix',
                '#chat-show-reply-prefix-checkbox',
                value,
              )
            }
          />
        </div>
      </Accordion>
    </div>
  );
};

export default memo(AdvancedFormatting);
