import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class Token {
  @Field(() => String)
  access_token: string;
}
