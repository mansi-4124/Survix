import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SlugValidationPipe implements PipeTransform<any, any> {
  transform(value: any): any {
    if (!value || typeof value.slug !== 'string') {
      return value;
    }

    const normalized = value.slug.trim().toLowerCase();
    const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized);

    if (!isValid) {
      throw new BadRequestException(
        'Slug must be lowercase, alphanumeric, and may contain hyphens',
      );
    }

    return {
      ...value,
      slug: normalized,
    };
  }
}
