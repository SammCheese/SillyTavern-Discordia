// shamelessly copied from ST code

const { getRequestHeaders, getThumbnailUrl, this_chid, getCharacters } =
  await imports('@script');
const { tag_import_setting } = await imports('@scripts/tags');

/**
 * Imports a character from a file.
 * @param {File} file File to import
 * @param {object} [options] - Options
 * @param {string} [options.preserveFileName] Whether to preserve original file name
 * @param {Boolean} [options.importTags=false] Whether to import tags
 * @returns {Promise<string>}
 */
export async function importCharacter(
  file,
  { preserveFileName = '', importTags = false } = {},
) {
  const ext = file.name.match(/\.(\w+)$/);
  if (
    !ext ||
    !['json', 'png', 'yaml', 'yml', 'charx', 'byaf'].includes(
      ext[1].toLowerCase(),
    )
  ) {
    return;
  }

  const exists = preserveFileName
    ? SillyTavern.getContext().characters.find(
        (character) => character.avatar === preserveFileName,
      )
    : undefined;

  const format = ext[1].toLowerCase();
  $('#character_import_file_type').val(format);
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('file_type', format);
  formData.append('user_name', SillyTavern.getContext().name1);
  if (preserveFileName) formData.append('preserved_name', preserveFileName);

  try {
    const result = await fetch('/api/characters/import', {
      method: 'POST',
      body: formData,
      headers: getRequestHeaders({ omitContentType: true }),
      cache: 'no-cache',
    });

    if (!result.ok) {
      throw new Error(`Failed to import character: ${result.statusText}`);
    }

    const data = await result.json();

    if (data.error) {
      throw new Error(`Server returned an error: ${data.error}`);
    }

    if (data.file_name !== undefined) {
      const avatarFileName = `${data.file_name}.png`;

      // Refresh existing thumbnail
      if (exists && this_chid !== undefined) {
        await fetch(getThumbnailUrl('avatar', avatarFileName), {
          cache: 'reload',
        });
      }

      $('#character_search_bar').val('').trigger('input');

      if (exists) {
        toastr.success(
          `Character Replaced: ${String(data.file_name).replace('.png', '')}`,
        );
      } else {
        toastr.success(
          `Character Created: ${String(data.file_name).replace('.png', '')}`,
        );
      }
      if (importTags) {
        await importCharactersTags([avatarFileName]);
      }
      return avatarFileName;
    }
  } catch (error) {
    console.error('Error importing character', error);
    toastr.error(
      `The file is likely invalid or corrupted.`,
      `Could not import character`,
    );
  }
}

/**
 * Imports tags for the given characters
 * @param {string[]} avatarFileNames character avatar filenames whose tags are to import
 */
async function importCharactersTags(avatarFileNames) {
  await getCharacters();
  for (let i = 0; i < avatarFileNames.length; i++) {
    if (
      SillyTavern.getContext().powerUserSettings.tag_import_setting !==
      tag_import_setting.NONE
    ) {
      const importedCharacter = SillyTavern.getContext().characters.find(
        (character) => character.avatar === avatarFileNames[i],
      );
      if (importedCharacter) {
        await SillyTavern.getContext().importTags(importedCharacter);
      }
    }
  }
}
