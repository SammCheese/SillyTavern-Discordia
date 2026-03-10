import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import SystemPrompt from './sections/SystemPrompt';
import Accordion from '../../../components/common/Accordion/Accordion';
import type { MainAPIValues } from '../connection/services/connectionManager';
import SectionTitle from './components/SectionTitle';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const FormattingSettings = () => {
  const [syspromptEnabled, setSyspromptEnabled] = useState(
    SillyTavern.getContext().powerUserSettings.sysprompt?.enabled,
  );

  const supported = useMemo(() => {
    const type = SillyTavern.getContext().mainApi as MainAPIValues;
    switch (type) {
      case 'textgenerationwebui':
        return true;
      default:
        return false;
    }
  }, []);

  const handleToggleSystemPrompt = useCallback(() => {
    const current =
      SillyTavern.getContext().powerUserSettings.sysprompt?.enabled ?? false;
    SillyTavern.getContext().powerUserSettings.sysprompt = {
      ...SillyTavern.getContext().powerUserSettings.sysprompt,
      enabled: !current,
    };
    setSyspromptEnabled(!current);
  }, []);

  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Formatting Settings">
      <div className="settings-section">
        {supported ? (
          <Accordion
            title={
              <SectionTitle
                title="System Prompt"
                onClick={handleToggleSystemPrompt}
                enabled={syspromptEnabled}
              />
            }
            isOpen={true}
          >
            <SystemPrompt />
          </Accordion>
        ) : (
          <div className="text-muted">
            No formatting settings available for the current API (yet)
          </div>
        )}
      </div>
    </SettingsFrame>
  );
};

export default FormattingSettings;
