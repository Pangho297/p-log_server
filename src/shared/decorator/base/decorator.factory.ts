import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDecoratorOptions } from './decorator.type';
import { ERROR_MESSAGE } from '@/shared/constants';
import { ValidateIf, ValidationOptions } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export class DecoratorFactory {
  static createPropertyDecorator(
    swaggerType: any,
    decorators: PropertyDecorator[],
    options: BaseDecoratorOptions = {},
  ): PropertyDecorator {
    const {
      optional = false,
      nullable = false,
      errorKey,
      description,
      example,
      deprecated,
    } = options;

    const allDecorators: PropertyDecorator[] = [];

    const SwaggerDecorator = optional ? ApiPropertyOptional : ApiProperty;

    allDecorators.push(
      SwaggerDecorator({
        type: swaggerType,
        nullable,
        description: description ?? this.getDescription(errorKey),
        example,
        deprecated,
      }),
    );

    allDecorators.push(...decorators);

    if (optional) {
      // optional = true 일 때만 undefined를 스킵
      // nullable = true면 null도 스킵해서 null 허용
      allDecorators.push(
        ValidateIf((_, value) =>
          nullable
            ? value !== undefined && value !== null
            : value !== undefined,
        ),
      );
    }

    return applyDecorators(...allDecorators);
  }

  private static getDescription(errorKey?: string): string | undefined {
    if (!errorKey) return undefined;

    return ERROR_MESSAGE[errorKey]?.description;
  }

  static createValidationOptions(
    errorKey?: string,
    options: ValidationOptions = {},
  ): ValidationOptions {
    return {
      ...options,
      message: options.message
        ? options.message
        : errorKey && ERROR_MESSAGE[errorKey]
          ? ERROR_MESSAGE[errorKey].message
          : options.message,
    };
  }
}
