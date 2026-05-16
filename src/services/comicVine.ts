import axios from 'axios';

export interface ComicVineCharacter {
  id: number;
  api_detail_url: string;
  name: string;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    thumb_url: string;
    tiny_url: string;
    super_url: string;
  };
  deck?: string;
  description?: string;
}

export interface DetailedCharacter extends ComicVineCharacter {
  description: string;
  powers: Array<{ id: number; name: string }>;
  story_arc_credits: Array<{ id: number; name: string }>;
  issue_credits: Array<{ id: number; name: string; api_detail_url: string }>;
}

export interface IssueInfo {
  image: {
    thumb_url: string;
    medium_url: string;
  };
  volume: {
    name: string;
  };
  issue_number: string;
  name?: string;
}

const api = axios.create({
  baseURL: '/api',
});

export const searchCharacters = async (query: string): Promise<ComicVineCharacter[]> => {
  const response = await api.get('/search', { params: { query } });
  return response.data.results;
};

export const getCharacterDetail = async (id: string): Promise<DetailedCharacter> => {
  const response = await api.get(`/character/${id}`);
  return response.data.results;
};

export const getIssueDetail = async (id: string): Promise<IssueInfo> => {
  const response = await api.get(`/issue/${id}`);
  return response.data.results;
};

export const extractIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 2]; // Format like 4005-1234
};
