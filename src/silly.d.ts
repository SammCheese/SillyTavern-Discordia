type Entity = {
  item: any;
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
