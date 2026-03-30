import { memo, useCallback, useMemo, useState } from 'react';
import Divider from '../../../../components/common/Divider/Divider';
import { textgen_settings_schema } from '../data/samplers';
import SettingsRow from '../components/SettingsRow';
import Select from '../../../../components/common/Select/Select';

const context = SillyTavern.getContext();

const { amount_gen, max_context } = await imports('@script');
const { textgenerationwebui_preset_names, textgenerationwebui_presets } =
  await imports('@scripts/textGenSettings');

const SCRIPT_SETTING_IDS = [
  'max_context',
  'amount_gen',
  'max_context_unlocked',
] as const;

const TextCompletionSamplerSettings = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>(() => ({
    ...context.textCompletionSettings,
    amount_gen,
    max_context,
    max_context_unlocked: context.powerUserSettings.max_context_unlocked,
  }));
  const [presets] = useState(
    (textgenerationwebui_preset_names ?? []).map((name) => ({
      value: name,
      label: name,
    })),
  );
  const [preset, setPreset] = useState<string>(
    context.textCompletionSettings.preset || '',
  );

  const onChange = useCallback(
    (id: string, value: number | boolean | string) => {
      setSettings((previousSettings) => ({ ...previousSettings, [id]: value }));

      if (
        SCRIPT_SETTING_IDS.includes(id as (typeof SCRIPT_SETTING_IDS)[number])
      ) {
        if (id === 'max_context_unlocked') {
          $('#max_context_unlocked')
            .prop('checked', value as boolean)
            .trigger('change');
        } else {
          $(`#${id}`).val(Number(value)).trigger('input');
        }
        context.saveSettingsDebounced();
        return;
      }

      if (Object.keys(context.textCompletionSettings).includes(id)) {
        context.textCompletionSettings[id] = value;
        context.saveSettingsDebounced();
      }
    },
    [],
  );

  const renderedSettings = useMemo(() => {
    const unlocked = Boolean(settings.max_context_unlocked);
    return Object.entries(textgen_settings_schema(unlocked).TextGenWebUI).map(
      ([key]) => (
        <div key={key} className="w-full">
          <h3 className="text-xl font-semibold mb-2 ml-4">{key}</h3>
          <SettingsRow
            key={key}
            settings={textgen_settings_schema(unlocked).TextGenWebUI[key]!}
            values={settings}
            onChange={onChange}
          />
          <Divider key={`${key}-divider`} />
        </div>
      ),
    );
  }, [onChange, settings]);

  const handlePresetChange = useCallback((value: string | number) => {
    const selected =
      textgenerationwebui_presets[
        textgenerationwebui_preset_names.indexOf(value as string)
      ];
    if (!selected) return;

    context.textCompletionSettings.preset = selected.name;

    for (const name of Object.keys(selected) as (keyof typeof selected)[]) {
      const value = selected[name];
      if (value === undefined) continue;
      context.textCompletionSettings[name] = value;
    }

    setPreset(selected.name);
    context.textCompletionSettings.preset = selected.name;
    context.saveSettingsDebounced();

    setSettings((prev) => ({ ...prev, ...selected }));
  }, []);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Text Completion{' '}
        </h2>
      </div>

      <div className="mb-4 w-full flex flex-col gap-2">
        <Select
          options={presets}
          onChange={handlePresetChange}
          value={preset}
        />
      </div>

      <Divider />

      <div>
        <SettingsRow
          settings={
            textgen_settings_schema(Boolean(settings.max_context_unlocked))
              .Common.Generation
          }
          values={settings}
          onChange={onChange}
        />
      </div>

      <Divider />

      <div>{renderedSettings}</div>
    </>
  );
};

export default memo(TextCompletionSamplerSettings);
