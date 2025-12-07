const { getTextGenServer, textgenerationwebui_settings, textgen_types, SERVER_INPUTS } = await imports("@scripts/textGenSettings")
const { getRequestHeaders } = await imports("@script")

export const getTextGenStatus = async (server?: string): Promise<string | false | undefined> => {
  // This triggers the whole setup spiel.
  // Original functions arent exported...
  const button = $('#api_button_textgenerationwebui');
  const serverInput = $(`${SERVER_INPUTS[server]}`);
  if (button && serverInput) {
    serverInput.val(getTextGenServer(server));
    button.trigger('click');
  }

  // consinue with our own check
    const url = '/api/backends/text-completions/status';

      const endpoint = getTextGenServer();

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
