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



