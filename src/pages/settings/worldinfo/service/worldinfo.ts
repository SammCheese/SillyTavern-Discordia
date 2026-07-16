import { saveWISettingsViaDOM } from './legacy';
import { worldInfoModule } from '../../../../st/worldInfo';

export async function getAllWorldInfos() {
  return worldInfoModule.world_names;
}

export async function saveWorldInfo(settings, active_worldinfo: string[]) {
  try {
    worldInfoModule.updateWorldInfoSettings(settings, active_worldinfo);
  } catch {
    console.warn(
      'Error importing updateWorldInfoSettings, falling back to DOM',
    );
    saveWISettingsViaDOM(settings, active_worldinfo);
  }
}
