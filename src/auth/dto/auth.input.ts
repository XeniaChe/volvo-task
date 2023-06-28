import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  // IsStrongPassword, // Switched off while testing
} from 'class-validator';

@InputType()
export class AuthInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(13, {
    message: 'Password shuld be min 8 characters long',
  })
  // @IsStrongPassword()
  password: string;
}

@InputType()
export class VerificationInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  code: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
