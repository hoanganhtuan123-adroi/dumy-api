export interface IPostResponse {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
}

export interface IGetPostResponse {
  total: number;
  limit: number;
  skip: number;
  posts: IPostResponse[];
}
