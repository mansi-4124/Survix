import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidV4Regex.test(value)) {
      throw new BadRequestException(
        'Validation failed (UUID v4 string is expected)',
      );
    }

    return value;
  }
}
