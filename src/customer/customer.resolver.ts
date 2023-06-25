import { Args, Query, Resolver } from '@nestjs/graphql';
import { Customer } from 'lib/entities/';
import { CustomerService } from './customer.service';
import { GetCustomerInput } from './dto/customer.input';
import { CurrentUser } from './decorator';
import { AccessTokenGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [Customer])
  @UseGuards(AccessTokenGuard)
  async customers(
    @CurrentUser() currUser: Customer,
    @Args('data') { skip, take, where }: GetCustomerInput,
  ) {
    return this.customerService.findAll({ skip, take, where });
  }
}
