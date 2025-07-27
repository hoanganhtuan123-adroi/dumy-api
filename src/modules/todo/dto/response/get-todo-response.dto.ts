export interface TodoResponseDto {
  id:number;
  name: string;
  completed: boolean;
  userId: number;
}

export interface GetAllTodoResponseDto {
  todos: TodoResponseDto[];
  total: number;
  limit: number;
  skip: number;
}
