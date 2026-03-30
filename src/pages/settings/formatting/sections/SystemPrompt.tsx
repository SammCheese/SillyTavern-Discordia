import { memo, useCallback, useState } from 'react';
import Select from '../../../../components/common/Select/Select';
import Input from '../../../../components/common/Input/Input';

const context = SillyTavern.getContext();

const { saveSettingsDebounced } = await imports('@script');
const { system_prompts } = await imports('@scripts/sysprompt');

const lodash = SillyTavern.libs.lodash;

const SystemPromptSettings = () => {
  const [sysPrompt, setSysPrompt] = useState(
    context.powerUserSettings.sysprompt || '',
  );
  const [options] = useState(
    (system_prompts ?? [])?.map((p) => ({ value: p.name, label: p.name })),
  );

  const handlePromptChange = useCallback(
    (value: string) => {
      setSysPrompt((prev) => ({ ...prev, content: value }));

      lodash.debounce(() => {
        context.powerUserSettings.sysprompt = {
          ...sysPrompt,
          content: value,
        };
        saveSettingsDebounced();
      }, 500)();
    },
    [sysPrompt],
  );

  const handlePromptSelect = useCallback((value: string | number) => {
    const selected = system_prompts.find((p) => p.name === value);
    if (!selected) return;

    const enabled = context.powerUserSettings.sysprompt?.enabled ?? false;
    selected.enabled = enabled;

    setSysPrompt(selected);
    context.powerUserSettings.sysprompt = selected;
    saveSettingsDebounced();
  }, []);

  return (
    <div className="settings-section flex flex-col gap-4">
      <div className="flex flex-row w-full gap-2 items-center">
        <Select
          options={options}
          value={sysPrompt.name}
          onChange={handlePromptSelect}
        />
      </div>

      <div>
        <Input
          growHeight
          value={sysPrompt.content}
          onChange={handlePromptChange}
          label="System Prompt"
          maxHeight={300}
        />
      </div>

      <div></div>
    </div>
  );
};

export default memo(SystemPromptSettings);
