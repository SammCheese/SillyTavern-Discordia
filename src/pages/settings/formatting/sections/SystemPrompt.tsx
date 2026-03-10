import { memo, useCallback, useState } from 'react';
import Select from '../../../../components/common/Select/Select';
import Input from '../../../../components/common/Input/Input';

const context = SillyTavern.getContext();

const { saveSettingsDebounced } = await imports('@script');

const _ = window._;

const SystemPromptSettings = () => {
  const [sysPrompt, setSysPrompt] = useState(
    context.powerUserSettings.sysprompt || '',
  );
  const options = [{ value: sysPrompt.name, label: sysPrompt.name }];

  const handlePromptChange = useCallback(
    (value: string) => {
      setSysPrompt((prev) => ({ ...prev, content: value }));

      _.debounce(() => {
        context.powerUserSettings.sysprompt = {
          ...sysPrompt,
          content: value,
        };
        saveSettingsDebounced();
      }, 500)();
    },
    [sysPrompt],
  );

  return (
    <div className="settings-section flex flex-col gap-4">
      <div className="flex flex-row w-full gap-2 items-center">
        <Select options={options} disabled value={sysPrompt.name} />
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
