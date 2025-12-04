const { getTextGenServer, textgenerationwebui_settings, textgen_types } = await imports("@scripts/textGenSettings")
const { getRequestHeaders } = await imports("@script")

export const getTextGenStatus = async (server?: string): Promise<string|false>  => {
  const url = '/api/backends/text-completions/status';

  const endpoint =  server ?? getTextGenServer();

  if (!endpoint) {
    console.warn('No endpoint for status check');

  }

  if ([textgen_types.GENERIC, textgen_types.OOBA].includes(textgenerationwebui_settings.type) && textgenerationwebui_settings.bypass_status_check) {
    return "bypassed";
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        api_server: endpoint,
        api_type: textgenerationwebui_settings.type,
      }),
    });

    const data = await response.json();
    if (response.ok && data?.["result"]) {
      return data["result"];
    } else {
      return false;
    }
  } catch (err) {
    console.error('Error checking text generation server status:', err);
    return false;
  }
}
