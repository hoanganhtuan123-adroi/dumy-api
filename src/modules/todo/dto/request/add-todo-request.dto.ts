import { IsNotEmpty, IsOptional } from "class-validator";

export class AddTodoRequestDto{
    @IsNotEmpty({message: "Name todo can't be empty!"})
    name: string;
    
    @IsOptional()
    completed: boolean = false;
}