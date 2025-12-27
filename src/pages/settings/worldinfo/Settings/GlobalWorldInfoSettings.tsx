import { memo } from 'react';
import Checkbox from '../../../../components/common/Checkbox/Checkbox';
import Select from '../../../../components/common/Select/Select';
import Slider from '../../../../components/common/Slider/Slider';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { getWorldInfoSettings } = await imports('@scripts/worldInfo');

interface GlobalWorldInfoSettingsProps {
  settings: ReturnType<typeof getWorldInfoSettings>;
  handleSettingsChange: (
    key: string,
    value: string | boolean | number | undefined,
  ) => void;
}

const insertionStrategy = [
  { label: 'Evenly', value: 0 },
  { label: 'Character First', value: 1 },
  { label: 'Global First', value: 2 },
];

const GlobalWorldInfoSettings = ({
  settings,
  handleSettingsChange,
}: GlobalWorldInfoSettingsProps) => {
  return (
    <>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Insertion Strategy</label>
        <Select
          options={insertionStrategy}
          value={settings.world_info_character_strategy}
          onChange={(value) =>
            handleSettingsChange('world_info_character_strategy', value)
          }
        />
      </div>

      <div className="mb-4">
        <Checkbox
          label="Include Names"
          checked={settings.world_info_include_names}
          onChange={(checked) => {
            handleSettingsChange('world_info_include_names', checked);
          }}
        />
      </div>
      <div className="mb-4">
        <Checkbox
          label="Recursive Scan"
          checked={settings.world_info_recursive}
          onChange={(checked) => {
            handleSettingsChange('world_info_recursive', checked);
          }}
        />
      </div>
      <div className="mb-4">
        <Checkbox
          label="Case-sensitive"
          checked={settings.world_info_case_sensitive}
          onChange={(checked) => {
            handleSettingsChange('world_info_case_sensitive', checked);
          }}
        />
      </div>
      <div className="mb-4">
        <Checkbox
          label="Match Whole Words"
          checked={settings.world_info_match_whole_words}
          onChange={(checked) => {
            handleSettingsChange('world_info_match_whole_words', checked);
          }}
        />
      </div>
      <div className="mb-4">
        <Checkbox
          label="Use Group Scoring"
          checked={settings.world_info_use_group_scoring}
          onChange={(checked) => {
            handleSettingsChange('world_info_use_group_scoring', checked);
          }}
        />
      </div>
      <div className="mb-4">
        <Checkbox
          label="Alert on Overflow"
          checked={settings.world_info_overflow_alert}
          onChange={(checked) => {
            handleSettingsChange('world_info_overflow_alert', checked);
          }}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Scan Depth</label>
        <Slider
          min={0}
          max={1000}
          step={1}
          value={settings.world_info_depth}
          onChange={(value) => handleSettingsChange('world_info_depth', value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Context %</label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={settings.world_info_budget}
          onChange={(value) => handleSettingsChange('world_info_budget', value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Budget Cap</label>
        <Slider
          min={0}
          max={65536}
          step={1}
          value={settings.world_info_budget_cap}
          onChange={(value) =>
            handleSettingsChange('world_info_budget_cap', value)
          }
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Min Activations</label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={settings.world_info_min_activations}
          onChange={(value) =>
            handleSettingsChange('world_info_min_activations', value)
          }
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Max Depth</label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={settings.world_info_min_activations_depth_max}
          onChange={(value) =>
            handleSettingsChange('world_info_min_activations_depth_max', value)
          }
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Max Recursion Steps</label>
        <Slider
          min={0}
          max={10}
          step={1}
          value={settings.world_info_max_recursion_steps}
          onChange={(value) =>
            handleSettingsChange('world_info_max_recursion_steps', value)
          }
        />
      </div>
    </>
  );
};

export default memo(GlobalWorldInfoSettings);
