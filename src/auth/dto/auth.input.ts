import { Field, InputType } from '@nestjs/graphql';

//TODO: verify
@InputType()
export class AuthInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
