import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, contx: ExecutionContext) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const request: any = contx.switchToHttp().getRequest();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const user = request.user;
  if (!user) {
    throw new InternalServerErrorException('User not found in request');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return user;
});
