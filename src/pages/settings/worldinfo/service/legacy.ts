// This is legitimately hell
export function saveWISettingsViaDOM(settings, active_worldinfo) {
  const {
    world_info_depth,
    world_info_min_activations,
    world_info_min_activations_depth_max,
    world_info_budget,
    world_info_include_names,
    world_info_recursive,
    world_info_overflow_alert,
    world_info_case_sensitive,
    world_info_match_whole_words,
    world_info_use_group_scoring,
    world_info_character_strategy,
    world_info_budget_cap,
    world_info_max_recursion_steps,
  } = settings;

  $('#world_info_depth_counter').val(world_info_depth);
  $('#world_info_depth').val(world_info_depth);

  $('#world_info_min_activations_counter').val(world_info_min_activations);
  $('#world_info_min_activations').val(world_info_min_activations);

  $('#world_info_min_activations_depth_max_counter').val(
    world_info_min_activations_depth_max,
  );
  $('#world_info_min_activations_depth_max').val(
    world_info_min_activations_depth_max,
  );

  $('#world_info_budget_counter').val(world_info_budget);
  $('#world_info_budget').val(world_info_budget);

  $('#world_info_include_names').prop('checked', world_info_include_names);
  $('#world_info_recursive').prop('checked', world_info_recursive);
  $('#world_info_overflow_alert').prop('checked', world_info_overflow_alert);
  $('#world_info_case_sensitive').prop('checked', world_info_case_sensitive);
  $('#world_info_match_whole_words').prop(
    'checked',
    world_info_match_whole_words,
  );
  $('#world_info_use_group_scoring').prop(
    'checked',
    world_info_use_group_scoring,
  );

  $(
    `#world_info_character_strategy option[value='${world_info_character_strategy}']`,
  ).prop('selected', true);
  $('#world_info_character_strategy').val(world_info_character_strategy);

  $('#world_info_budget_cap').val(world_info_budget_cap);
  $('#world_info_budget_cap_counter').val(world_info_budget_cap);

  $('#world_info_max_recursion_steps').val(world_info_max_recursion_steps);
  $('#world_info_max_recursion_steps_counter').val(
    world_info_max_recursion_steps,
  );

  const world_names = active_worldinfo?.length ? active_worldinfo : [];

  if (world_names.length > 0) {
    $('#world_info').empty();
  }

  world_names.forEach((item, i) => {
    $('#world_info').append(
      `<option value='${i}'${active_worldinfo.includes(item) ? ' selected' : ''}>${item}</option>`,
    );
    $('#world_editor_select').append(`<option value='${i}'>${item}</option>`);
  });

  $('#world_info').trigger('change');
  $('#world_editor_select').trigger('change');

  $('#world_info_depth').trigger('input');
  $('#world_info_min_activations').trigger('input');
  $('#world_info_min_activations_depth_max').trigger('input');
  $('#world_info_budget').trigger('input');
  $('#world_info_budget_cap').trigger('input');
  $('#world_info_max_recursion_steps').trigger('input');
  $('#world_info_include_names').trigger('input');
  $('#world_info_recursive').trigger('input');
  $('#world_info_case_sensitive').trigger('input');
  $('#world_info_match_whole_words').trigger('input');

  $('#world_info_overflow_alert').trigger('change');
  $('#world_info_character_strategy').trigger('change');
  $('#world_info_use_group_scoring').trigger('change');
}
