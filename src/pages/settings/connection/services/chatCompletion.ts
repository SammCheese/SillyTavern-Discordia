import { getRequestHeaders } from '../../../../st/script';
import { chat_completion_sources, oai_settings } from '../../../../st/openai';
import { isValidUrl } from '../../../../st/utils';

type StatusResponse = {
  result?: string;
  error?: unknown;
  bypass?: boolean;
  data?: unknown;
};

export const getChatCompletionStatus = async (
  server?: string,
): Promise<string | false | undefined> => {
  const url = '/api/backends/chat-completions/status';

  const source = oai_settings.chat_completion_source;

  const noValidateSources = [
    chat_completion_sources.CLAUDE,
    chat_completion_sources.AI21,
    chat_completion_sources.VERTEXAI,
    chat_completion_sources.PERPLEXITY,
    chat_completion_sources.ZAI,
  ];

  if (noValidateSources.includes(source)) {
    return 'Key saved; press "Test Message" to verify.';
  }

  if (
    source === chat_completion_sources.CUSTOM &&
    !isValidUrl(server ?? oai_settings.custom_url)
  ) {
    console.debug(
      'Invalid endpoint URL of Custom OpenAI API:',
      server ?? oai_settings.custom_url,
    );
    return 'Invalid endpoint URL. Requests may fail.';
  }

  if (
    source === chat_completion_sources.AZURE_OPENAI &&
    !isValidUrl(oai_settings.azure_base_url)
  ) {
    console.debug(
      'Invalid endpoint URL of Azure OpenAI API:',
      oai_settings.azure_base_url,
    );
    return 'Invalid Azure endpoint URL. Requests may fail.';
  }

  const requestData: Record<string, unknown> = {
    reverse_proxy: oai_settings.reverse_proxy,
    proxy_password: oai_settings.proxy_password,
    chat_completion_source: source,
  };

  // Keep existing behavior: allow a direct server override for CUSTOM sources.
  if (source === chat_completion_sources.CUSTOM) {
    requestData.custom_url = server ?? oai_settings.custom_url;
    requestData.custom_include_headers = oai_settings.custom_include_headers;
  }

  if (source === chat_completion_sources.AZURE_OPENAI) {
    requestData.azure_base_url = oai_settings.azure_base_url;
    requestData.azure_deployment_name = oai_settings.azure_deployment_name;
    requestData.azure_api_version = oai_settings.azure_api_version;
  }

  if (source === chat_completion_sources.SILICONFLOW) {
    requestData.siliconflow_endpoint = oai_settings.siliconflow_endpoint;
  }

  if (source === chat_completion_sources.WORKERS_AI) {
    requestData.workers_ai_account_id = oai_settings.workers_ai_account_id;
  }

  const canBypass =
    (source === chat_completion_sources.OPENAI &&
      oai_settings.bypass_status_check) ||
    source === chat_completion_sources.CUSTOM;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify(requestData),
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = (await response.json()) as StatusResponse;

    if (data.bypass) {
      return 'Status check bypassed';
    }

    if ('error' in data) {
      return false;
    }

    if (typeof data.result === 'string' && data.result.length > 0) {
      return data.result;
    }

    return 'Valid';
  } catch (err) {
    console.error('Error checking chat completion server status:', err);
    return canBypass ? 'Status check bypassed' : false;
  }
};
