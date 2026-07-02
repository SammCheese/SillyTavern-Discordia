import { lazy, memo, useEffect, useMemo } from 'react';
import type { MainAPIValues } from '../connection/hooks/connectionManager';
import TextCompletionFormatting from './API/textcompletion/TextCompletionFormatting/TextCompletionFormatting';
import ChatCompletionFormatting from './API/chatcompletion/ChatCompletionFormatting/ChatCompletionFormatting';

import { saveSettingsDebounced } from '../../../st/script';
const SettingsFrame = lazy(() => import('../base/Base'));

const FormattingSettings = () => {
  const FormattingSettings = useMemo(() => {
    const type = SillyTavern.getContext().mainApi as MainAPIValues;
    switch (type) {
      case 'textgenerationwebui':
        return TextCompletionFormatting;
      case 'openai':
        return ChatCompletionFormatting;
      default:
        return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Formatting Settings">
      <div className="settings-section">
        {FormattingSettings ? (
          <FormattingSettings />
        ) : (
          <div className="text-muted">
            No formatting settings available for the current API (yet)
          </div>
        )}
      </div>
    </SettingsFrame>
  );
};

export default memo(FormattingSettings);
