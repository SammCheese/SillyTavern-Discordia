/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../../components/common/Button/Button';
import Checkbox from '../../../../components/common/Checkbox/Checkbox';
import Divider from '../../../../components/common/Divider/Divider';
import Input from '../../../../components/common/Input/Input';
import Select from '../../../../components/common/Select/Select';
import SamplerSlider from '../components/SamplerSlider';

type SettingValue = unknown;
type LogitBiasEntry = {
  id?: string;
  text?: string;
  value?: number;
};

const context = SillyTavern.getContext();
const { saveSettingsDebounced } = await imports('@script');
const { oai_settings, settingsToUpdate, chat_completion_sources } =
  await imports('@scripts/openai');

const ChatCompletionSamplerSettings = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>(() => ({
    ...(oai_settings as Record<string, unknown>),
  }));
  const [presetOptions, setPresetOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [presetValue, setPresetValue] = useState<string>('');
  const [maxContextCap, setMaxContextCap] = useState<number>(128000);

  const [biasPresetOptions, setBiasPresetOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const source = String(settings.chat_completion_source || 'openai');

  const syncFromNativeState = useCallback(() => {
    const next = { ...(oai_settings as Record<string, unknown>) };
    setSettings(next);

    const presetSelect = $('#settings_preset_openai');
    const selectedPresetValue = String(presetSelect.val() ?? '');

    const options = presetSelect
      .find('option')
      .map(function () {
        return {
          value: String($(this).val()),
          label: String($(this).text()),
        };
      })
      .get();

    setPresetOptions(options);
    setPresetValue(selectedPresetValue);

    const maxFromDom = Number($('#openai_max_context').attr('max') ?? 128000);
    setMaxContextCap(Number.isFinite(maxFromDom) ? maxFromDom : 128000);

    const biasPresets =
      ((oai_settings as Record<string, unknown>).bias_presets as Record<
        string,
        unknown
      >) || {};
    const biasOptions = Object.keys(biasPresets).map((name) => ({
      value: name,
      label: name,
    }));

    setBiasPresetOptions(biasOptions);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFromNativeState();

    const sync = () => syncFromNativeState();
    $(document).on(
      'input.discordiaSampler change.discordiaSampler',
      '#settings_preset_openai, #openai_logit_bias_preset, #chat_completion_source, #openai_max_context, #openai_max_tokens, #n_openai, #stream_toggle, #temp_openai, #freq_pen_openai, #pres_pen_openai, #top_p_openai, #top_k_openai, #top_a_openai, #min_p_openai, #repetition_penalty_openai, #continue_prefill, #squash_system_messages, #openai_function_calling, #openai_media_inlining, #openai_show_thoughts, #openai_reasoning_effort, #openai_verbosity, #openai_inline_image_quality, #openai_request_images, #request_image_resolution, #request_image_aspect_ratio, #names_behavior, #continue_postfix, #seed_openai, #bind_preset_to_connection',
      sync,
    );

    return () => {
      $(document).off('.discordiaSampler');
    };
  }, [syncFromNativeState]);

  const triggerNativeButton = useCallback(
    (selector: string) => {
      const element = $(selector);
      if (!element.length) return;
      element.trigger('click');
      window.setTimeout(syncFromNativeState, 0);
    },
    [syncFromNativeState],
  );

  const applySetting = useCallback(
    (settingName: string, value: SettingValue) => {
      setSettings((previous) => ({ ...previous, [settingName]: value }));

      const globalSettings = oai_settings as Record<string, unknown>;
      globalSettings[settingName] = value;

      if (context.chatCompletionSettings) {
        context.chatCompletionSettings[settingName] = value as never;
      }

      const mapping = Object.values(
        settingsToUpdate as Record<string, unknown[]>,
      ).find((entry) => String(entry[1]) === settingName);

      if (mapping) {
        const selector = String(mapping[0]);
        const isCheckbox = Boolean(mapping[2]);
        const input = $(selector);

        if (input.length) {
          if (isCheckbox) {
            input.prop('checked', Boolean(value));
          } else {
            input.val(value as string | number);
          }

          const eventType = input.is('select') ? 'change' : 'input';
          input.trigger(eventType);
        }
      }

      saveSettingsDebounced();
    },
    [],
  );

  const applyNumberSetting = useCallback(
    (settingName: string, value: number) => applySetting(settingName, value),
    [applySetting],
  );

  const handlePresetChange = useCallback(
    (value: string | number) => {
      $('#settings_preset_openai').val(String(value)).trigger('change');
      window.setTimeout(() => {
        syncFromNativeState();
      }, 0);
    },
    [syncFromNativeState],
  );

  const handleBiasPresetChange = useCallback(
    (value: string | number) => {
      applySetting('bias_preset_selected', String(value));
      $('#openai_logit_bias_preset').val(String(value)).trigger('change');
      window.setTimeout(syncFromNativeState, 0);
    },
    [applySetting, syncFromNativeState],
  );

  const selectedBiasPreset = String(settings.bias_preset_selected || '');

  const biasEntries = useMemo(() => {
    const presets = (settings.bias_presets || {}) as Record<string, unknown>;
    const entries = presets[selectedBiasPreset];

    if (!Array.isArray(entries)) return [];
    return entries as LogitBiasEntry[];
  }, [selectedBiasPreset, settings.bias_presets]);

  const persistBiasEntries = useCallback(
    (entries: LogitBiasEntry[]) => {
      const biasPresets = {
        ...((oai_settings as Record<string, unknown>).bias_presets as Record<
          string,
          LogitBiasEntry[]
        >),
        [selectedBiasPreset]: entries,
      };

      applySetting('bias_presets', biasPresets);
      $('#openai_logit_bias_preset').trigger('change');
      window.setTimeout(syncFromNativeState, 0);
    },
    [applySetting, selectedBiasPreset, syncFromNativeState],
  );

  const updateBiasEntry = useCallback(
    (index: number, key: 'text' | 'value', value: string | number) => {
      const nextEntries = [...biasEntries];
      nextEntries[index] = {
        ...nextEntries[index],
        [key]: key === 'value' ? Number(value) : String(value),
      };
      persistBiasEntries(nextEntries);
    },
    [biasEntries, persistBiasEntries],
  );

  const removeBiasEntry = useCallback(
    (index: number) => {
      const nextEntries = biasEntries.filter((_, i) => i !== index);
      persistBiasEntries(nextEntries);
    },
    [biasEntries, persistBiasEntries],
  );

  const showRequestImageFields =
    source === chat_completion_sources.MAKERSUITE ||
    source === chat_completion_sources.VERTEXAI;

  const generationSliders = [
    {
      id: 'openai_max_context',
      label: 'Context Size (tokens)',
      min: 512,
      max: maxContextCap,
      step: 1,
    },
    {
      id: 'openai_max_tokens',
      label: 'Max Response Length (tokens)',
      min: 1,
      max: 128000,
      step: 1,
    },
    {
      id: 'n',
      label: 'Multiple swipes per generation',
      min: 1,
      max: 32,
      step: 1,
    },
    {
      id: 'seed',
      label: 'Seed',
      min: -1,
      max: 999999999,
      step: 1,
    },
  ];

  const samplerSliders = [
    {
      id: 'temp_openai',
      label: 'Temperature',
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      id: 'freq_pen_openai',
      label: 'Frequency Penalty',
      min: -2,
      max: 2,
      step: 0.01,
    },
    {
      id: 'pres_pen_openai',
      label: 'Presence Penalty',
      min: -2,
      max: 2,
      step: 0.01,
    },
    {
      id: 'top_p_openai',
      label: 'Top P',
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: 'top_k_openai',
      label: 'Top K',
      min: 0,
      max: 500,
      step: 1,
    },
    {
      id: 'top_a_openai',
      label: 'Top A',
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: 'min_p_openai',
      label: 'Min P',
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: 'repetition_penalty_openai',
      label: 'Repetition Penalty',
      min: 0,
      max: 2,
      step: 0.01,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-center">Chat Completion</h2>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Presets</h3>
        <Select
          options={presetOptions}
          value={presetValue}
          onChange={handlePresetChange}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            label="Update"
            onClick={() => triggerNativeButton('#update_oai_preset')}
          />
          <Button
            label="Save As"
            onClick={() => triggerNativeButton('#new_oai_preset')}
          />
          <Button
            label="Rename"
            onClick={() =>
              triggerNativeButton('[data-preset-manager-rename="openai"]')
            }
          />
          <Button
            label="Import"
            onClick={() => triggerNativeButton('#import_oai_preset')}
          />
          <Button
            label="Export"
            onClick={() => triggerNativeButton('#export_oai_preset')}
          />
          <Button
            label="Delete"
            onClick={() => triggerNativeButton('#delete_oai_preset')}
          />
        </div>
        <Checkbox
          label="Bind preset to connection"
          checked={Boolean(settings.bind_preset_to_connection)}
          onChange={(value) => applySetting('bind_preset_to_connection', value)}
        />
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Generation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-items-center">
          {generationSliders.map((item) => (
            <SamplerSlider
              key={`${item.id}-${String(settings[item.id] ?? '')}`}
              label={item.label}
              value={Number(settings[item.id] ?? item.min)}
              min={item.min}
              max={item.max}
              step={item.step}
              onChange={(value) => applyNumberSetting(item.id, value)}
            />
          ))}
        </div>
        <Checkbox
          label="Unlocked Context Size"
          checked={Boolean(settings.max_context_unlocked)}
          onChange={(value) => applySetting('max_context_unlocked', value)}
        />
        <Checkbox
          label="Streaming"
          checked={Boolean(settings.stream_openai)}
          onChange={(value) => applySetting('stream_openai', value)}
        />
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sampling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-items-center">
          {samplerSliders.map((item) => (
            <SamplerSlider
              key={`${item.id}-${String(settings[item.id] ?? '')}`}
              label={item.label}
              value={Number(settings[item.id] ?? item.min)}
              min={item.min}
              max={item.max}
              step={item.step}
              onChange={(value) => applyNumberSetting(item.id, value)}
            />
          ))}
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Behavior</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Checkbox
            label="Continue prefill"
            checked={Boolean(settings.continue_prefill)}
            onChange={(value) => applySetting('continue_prefill', value)}
          />
          <Checkbox
            label="Squash system messages"
            checked={Boolean(settings.squash_system_messages)}
            onChange={(value) => applySetting('squash_system_messages', value)}
          />
          <Checkbox
            label="Enable function calling"
            checked={Boolean(settings.function_calling)}
            onChange={(value) => applySetting('function_calling', value)}
          />
          <Checkbox
            label="Send inline media"
            checked={Boolean(settings.media_inlining)}
            onChange={(value) => applySetting('media_inlining', value)}
          />
          <Checkbox
            label="Request model reasoning"
            checked={Boolean(settings.show_thoughts)}
            onChange={(value) => applySetting('show_thoughts', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Reasoning Effort</label>
            <Select
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'min', label: 'Minimum' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'max', label: 'Maximum' },
              ]}
              value={String(settings.reasoning_effort || 'auto')}
              onChange={(value) =>
                applySetting('reasoning_effort', String(value))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Verbosity</label>
            <Select
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              value={String(settings.verbosity || 'auto')}
              onChange={(value) => applySetting('verbosity', String(value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Character Names Behavior
            </label>
            <Select
              options={[
                { value: '-1', label: 'None' },
                { value: '0', label: 'Default' },
                { value: '1', label: 'Completion Object' },
                { value: '2', label: 'Message Content' },
              ]}
              value={String(settings.names_behavior ?? '0')}
              onChange={(value) =>
                applySetting('names_behavior', Number(value))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Continue Postfix</label>
            <Select
              options={[
                { value: '', label: 'None' },
                { value: ' ', label: 'Space' },
                { value: '\n', label: 'Newline' },
                { value: '\n\n', label: 'Double Newline' },
              ]}
              value={String(settings.continue_postfix ?? ' ')}
              onChange={(value) =>
                applySetting('continue_postfix', String(value))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Inline Image Quality</label>
            <Select
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'low', label: 'Low' },
                { value: 'high', label: 'High' },
              ]}
              value={String(settings.inline_image_quality || 'auto')}
              onChange={(value) =>
                applySetting('inline_image_quality', String(value))
              }
            />
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Inline Images</h3>
        <Checkbox
          label="Request inline images"
          checked={Boolean(settings.request_images)}
          onChange={(value) => applySetting('request_images', value)}
        />

        {showRequestImageFields && Boolean(settings.request_images) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Resolution</label>
              <Select
                options={[
                  { value: '', label: 'Auto' },
                  { value: '1K', label: '1K' },
                  { value: '2K', label: '2K' },
                  { value: '4K', label: '4K' },
                ]}
                value={String(settings.request_image_resolution || '')}
                onChange={(value) =>
                  applySetting('request_image_resolution', String(value))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <Select
                options={[
                  { value: '', label: 'Auto' },
                  { value: '1:1', label: '1:1' },
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                  { value: '3:4', label: '3:4' },
                  { value: '4:3', label: '4:3' },
                  { value: '3:2', label: '3:2' },
                  { value: '2:3', label: '2:3' },
                  { value: '5:4', label: '5:4' },
                  { value: '4:5', label: '4:5' },
                  { value: '21:9', label: '21:9' },
                ]}
                value={String(settings.request_image_aspect_ratio || '')}
                onChange={(value) =>
                  applySetting('request_image_aspect_ratio', String(value))
                }
              />
            </div>
          </div>
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Logit Bias</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Preset</label>
            <Select
              options={biasPresetOptions}
              value={selectedBiasPreset}
              onChange={handleBiasPresetChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 self-end">
            <Button
              label="New"
              onClick={() =>
                triggerNativeButton('#openai_logit_bias_new_preset')
              }
            />
            <Button
              label="Import"
              onClick={() =>
                triggerNativeButton('#openai_logit_bias_import_preset')
              }
            />
            <Button
              label="Export"
              onClick={() =>
                triggerNativeButton('#openai_logit_bias_export_preset')
              }
            />
            <Button
              label="Delete"
              onClick={() =>
                triggerNativeButton('#openai_logit_bias_delete_preset')
              }
            />
          </div>
        </div>

        <Button
          label="Add bias entry"
          onClick={() => triggerNativeButton('#openai_logit_bias_new_entry')}
        />

        <div className="flex flex-col gap-2">
          {biasEntries.length === 0 && (
            <p className="text-xs text-gray-400">
              No bias entries in this preset.
            </p>
          )}
          {biasEntries.map((entry, index) => (
            <div
              key={`${entry.id || index}-${entry.text || ''}-${String(entry.value ?? 0)}`}
              className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px] gap-2 bg-black/20 p-2 rounded"
            >
              <Input
                label="Token/Text"
                value={String(entry.text || '')}
                onChange={(value) => updateBiasEntry(index, 'text', value)}
                type="text"
              />
              <Input
                label="Bias"
                value={Number(entry.value ?? 0)}
                onChange={(value) =>
                  updateBiasEntry(index, 'value', Number(value))
                }
                type="number"
              />
              <div className="flex items-end">
                <Button label="Remove" onClick={() => removeBiasEntry(index)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatCompletionSamplerSettings);
