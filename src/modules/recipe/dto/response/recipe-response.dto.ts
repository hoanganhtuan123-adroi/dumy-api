export interface IRecipeAddResponseDto {
  id: number;
  name: string;
  ingredients: string;
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  serving: number;
  difficult: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string;
  rating: number;
  reviewCount: number;
  mealType: string;
}

export interface IRecipeResponseDto {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  serving: number;
  difficult: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  mealType: string[];
  userId: number;
  image: string;
}

export interface IGetRecipesResponseDto {
  data: IRecipeResponseDto[];
  total: number;
  limit: number;
  skip: number;
}
