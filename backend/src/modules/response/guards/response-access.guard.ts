import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TokenPayload } from 'src/modules/auth/domain/types/token-payload.type';

@Injectable()
export class ResponseAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const responseId = request.params.responseId as string | undefined;
    const user = request.user as TokenPayload | undefined;

    if (!responseId) {
      throw new NotFoundException('Response id missing');
    }

    const responseEntity = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: { survey: true },
    });

    if (!responseEntity) {
      throw new NotFoundException('Response not found');
    }

    if (!user?.sub) {
      if (
        !responseEntity.anonymousId ||
        responseEntity.anonymousId !== request.anonymousId
      ) {
        throw new ForbiddenException('Response access denied');
      }
    } else {
      const isOwner = responseEntity.userId === user.sub;

      if (!isOwner) {
        throw new ForbiddenException('Response access denied');
      }
    }

    request.responseEntity = responseEntity;
    return true;
  }
}
