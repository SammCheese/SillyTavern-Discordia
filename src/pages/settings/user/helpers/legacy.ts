// ST doesnt expose this function on their own.
export const applyThemeColor = (type: string, color: string) => {
  if (type === 'main') {
    document.documentElement.style.setProperty('--SmartThemeBodyColor', color);
    const col = color.split('(')[1]!.split(')')[0]!.split(',');
    document.documentElement.style.setProperty(
      '--SmartThemeCheckboxBgColorR',
      col[0]!,
    );
    document.documentElement.style.setProperty(
      '--SmartThemeCheckboxBgColorG',
      col[1]!,
    );
    document.documentElement.style.setProperty(
      '--SmartThemeCheckboxBgColorB',
      col[2]!,
    );
    document.documentElement.style.setProperty(
      '--SmartThemeCheckboxBgColorA',
      col[3]!,
    );
  }
  if (type === 'italics') {
    document.documentElement.style.setProperty('--SmartThemeEmColor', color);
  }
  if (type === 'underline') {
    document.documentElement.style.setProperty(
      '--SmartThemeUnderlineColor',
      color,
    );
  }
  if (type === 'quote') {
    document.documentElement.style.setProperty('--SmartThemeQuoteColor', color);
  }
  /*     if (type === 'fastUIBG') {
            document.documentElement.style.setProperty('--SmartThemeFastUIBGColor', power_user.fastui_bg_color);
        } */
  if (type === 'blurTint') {
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    document.documentElement.style.setProperty(
      '--SmartThemeBlurTintColor',
      color,
    );
    metaThemeColor?.setAttribute('content', color);
  }
  if (type === 'chatTint') {
    document.documentElement.style.setProperty(
      '--SmartThemeChatTintColor',
      color,
    );
  }
  if (type === 'userMesBlurTint') {
    document.documentElement.style.setProperty(
      '--SmartThemeUserMesBlurTintColor',
      color,
    );
  }
  if (type === 'botMesBlurTint') {
    document.documentElement.style.setProperty(
      '--SmartThemeBotMesBlurTintColor',
      color,
    );
  }
  if (type === 'shadow') {
    document.documentElement.style.setProperty(
      '--SmartThemeShadowColor',
      color,
    );
  }
  if (type === 'border') {
    document.documentElement.style.setProperty(
      '--SmartThemeBorderColor',
      color,
    );
  }
};
