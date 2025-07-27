import { PartialType } from "@nestjs/mapped-types";
import { AddTodoRequestDto } from "./add-todo-request.dto";

export class UpdateTodoRequestDto extends PartialType(AddTodoRequestDto){};