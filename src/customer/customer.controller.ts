import { Controller, Get } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(
    // private prisma: PrismaService,
    private customerService: CustomerService,
  ) {}

  @Get()
  getAllCustomers() {
    return this.customerService.getAllAsync();
  }
}
