// @ts-expect-error - No types for jQuery
export const specialExtensionHandling = (element: JQueryDOMElement) => {
  // TunnelVision is special and doesn't follow the standard format, so we have to
  if (element.find('.tv-container').length > 0) {
    return element.find('.tv-container');
  }
};
