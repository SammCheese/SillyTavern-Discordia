type Entity = {
  item?: Character | Group | null;
  id: string | number;
  type: 'character' | 'group' | 'tag';
  entities?: Entity[] | null;
  hidden?: number | null;
  isUseless?: boolean | null;
};

type Icon = {
  className: string;
  title: string;
  showInProfile: boolean;
  id: string;
};


type Chat = {
  file_id: string;
  file_name: string;
  char_id?: number;
  avatar?: string;
  is_group?: boolean;
  group?: string;
};


type ConnectAPIMap = {
    selected: string;
    button?: string | null;
    type?: string | null;
    source?: string | null;
}


type Character = {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creatorcomment: string;
  tags: string[];
  talkativeness: number;
  fav: boolean | string;
  create_date: string;
  data: unknown; // v2 data extension
  // Non-standard extensions added by the ST server (not part of the original data)
  chat?: string;
  avatar?: string;
  json_data?: string;
  shallow?: boolean;
}

type Persona = {
  name: string;
  avatar: string;
};


type GroupItem = {
  activation_strategy: number;
  allow_self_responses: boolean;
  auto_mode_delay: number;
  avatar_url: string;
  chat_id: string;
  chat_size: number;
  chats: string[];
  create_date: string;
  date_added: string;
  data_last_chat: string;
  disabled_members: string[];
  fav: boolean;
  generation_mode: number;
  generation_mode_join_prefix: string;
  generation_mode_join_suffix: string;
  id: string;
  members: string[];
  name: string;
};
