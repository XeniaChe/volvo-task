import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class AccessToken {
  @Field(() => String)
  access_token: string;
}

@ObjectType({ isAbstract: true })
export class Tokens extends AccessToken {
  @Field(() => String)
  refresh_token: string;
}
