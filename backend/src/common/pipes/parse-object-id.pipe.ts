import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[a-fA-F0-9]{24}$/.test(value)) {
      throw new BadRequestException('Validation failed (Mongo ObjectId is expected)');
    }
    return value;
  }
}

