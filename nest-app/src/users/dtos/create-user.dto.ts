import { IsBoolean, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

}
