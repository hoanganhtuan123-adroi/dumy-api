import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFormDataJsonPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      // Parse các field JSON nếu có
      const parsedValue = { ...value };
      
      // Nếu có field nào là string JSON, parse nó
      Object.keys(parsedValue).forEach(key => {
        if (typeof parsedValue[key] === 'string') {
          try {
            // Thử parse xem có phải JSON không
            const parsed = JSON.parse(parsedValue[key]);
            if (typeof parsed === 'object') {
              parsedValue[key] = parsed;
            }
          } catch {
            // Không phải JSON, giữ nguyên giá trị string
          }
        }
      });

      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Invalid form data');
    }
  }
}