import { saveWISettingsViaDOM } from "./legacy";


export async function getAllWorldInfos() {
  const { world_names } = await imports("@scripts/worldInfo")
  return world_names;
}


export async function saveWorldInfo(settings , active_worldinfo: string[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore trial and error really
    const { updateWorldInfoSettings } = await imports("@scripts/worldInfo");
    updateWorldInfoSettings(settings, active_worldinfo);
  } catch {
    console.warn("Error importing updateWorldInfoSettings, falling back to DOM");
    saveWISettingsViaDOM(settings, active_worldinfo);
  }
}
