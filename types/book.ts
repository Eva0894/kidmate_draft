export type Page = {
    text: string;
    image?: string;
    audio?: string;
  };
  
  export type Book = {
    id: string;
    title: string;
    summary: string;
    cover: string;
    age_group?: string;
    category?: string;
    thumbnail?: string;
    cover_color?: string;
    pages: Page[];
  };
  
  export type ReadingLog = {
    book_id: string;
    page_index: number;
  };
  
  export type FavoriteUpdate = {
    book_id: string;
    is_favorite: boolean;
  };
  
  export type Bookmark = {
    book_id: string;
    page_index: number;
  };