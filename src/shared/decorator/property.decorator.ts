import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNegative,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import {
  ArrayDecoratorOptions,
  BaseDecoratorOptions,
  BooleanDecoratorOptions,
  NestedDecoratorOptions,
  NumberDecoratorOptions,
  StringDecoratorOptions,
} from './base/decorator.type';
import { DecoratorFactory } from './base/decorator.factory';
import { toBoolean, toDate, toNumber, toString } from './base/decorator.utils';

export function StringProperty(
  options: StringDecoratorOptions = {},
): PropertyDecorator {
  const {
    minLength,
    maxLength,
    pattern,
    trim: shouldTrim = false,
    lowercase = false,
    uppercase = false,
    transform: customTransform,
    ...baseOptions
  } = options;

  const transform = customTransform ?? (shouldTrim || lowercase || uppercase);

  const decorators: PropertyDecorator[] = [
    IsString(DecoratorFactory.createValidationOptions(options.errorKey)),
  ];

  if (transform) {
    const transformFn =
      typeof transform === 'function'
        ? transform
        : (value: unknown) => {
            let result = toString(value); // string 타입이 아닌 경우 강제 전환되어 검증됨
            if (shouldTrim) result = result.trim();
            if (lowercase) result = result.toLowerCase();
            if (uppercase) result = result.toUpperCase();
            return result;
          };

    decorators.push(
      Transform(({ value }) => transformFn(value), { toClassOnly: true }),
    );
  }

  if (minLength !== undefined) decorators.push(MinLength(minLength));
  if (maxLength !== undefined) decorators.push(MaxLength(maxLength));
  if (pattern) decorators.push(Matches(pattern));

  return DecoratorFactory.createPropertyDecorator(
    String,
    decorators,
    baseOptions,
  );
}

export function NumberProperty(
  options: NumberDecoratorOptions = {},
): PropertyDecorator {
  const {
    min,
    max,
    integer = false,
    positive = false,
    negative = false,
    allowNaN,
    allowInfinity,
    maxDecimalPlaces,
    transform = true,
    ...baseOptions
  } = options;

  const decorators: PropertyDecorator[] = [];

  if (transform) {
    const transformFn =
      typeof transform === 'function'
        ? transform
        : (value: unknown) => toNumber(value);

    decorators.push(
      Transform(
        ({ value }) => {
          try {
            return transformFn(value);
          } catch {
            return value;
          }
        },
        { toClassOnly: true },
      ),
    );
  }

  if (integer) {
    decorators.push(
      IsInt(DecoratorFactory.createValidationOptions(options.errorKey)),
    );
  } else {
    decorators.push(
      IsNumber(
        { allowNaN, allowInfinity, maxDecimalPlaces },
        DecoratorFactory.createValidationOptions(options.errorKey),
      ),
    );
  }

  if (min !== undefined) decorators.push(Min(min));
  if (max !== undefined) decorators.push(Max(max));
  if (positive) decorators.push(IsPositive());
  if (negative) decorators.push(IsNegative());

  return DecoratorFactory.createPropertyDecorator(
    Number,
    decorators,
    baseOptions,
  );
}

export function BooleanProperty(
  options: BooleanDecoratorOptions = {},
): PropertyDecorator {
  const { transform = true, nullable = false, ...baseOptions } = options;

  const decorators: PropertyDecorator[] = [];

  if (transform) {
    const transformFn =
      typeof transform === 'function'
        ? transform
        : (value: unknown) => toBoolean(value);

    decorators.push(
      Transform(({ value }) => transformFn(value), { toClassOnly: true }),
    );
  }

  if (nullable) {
    decorators.push(
      ValidateBy({
        name: 'isBooleanOrNull',
        validator: {
          validate: (value: any): boolean => {
            return typeof value === 'boolean' || value === 'null';
          },
          defaultMessage: () => '반드시 불리언 또는 null 값이어야 합니다',
        },
      }),
    );
  } else {
    decorators.push(
      IsBoolean(DecoratorFactory.createValidationOptions(options.errorKey)),
    );
  }

  return DecoratorFactory.createPropertyDecorator(
    Boolean,
    decorators,
    baseOptions,
  );
}

export function DateProperty(
  options: BaseDecoratorOptions = {},
): PropertyDecorator {
  const { transform = true, ...baseOptions } = options;
  const decorators: PropertyDecorator[] = [];

  if (transform) {
    const transformFn =
      typeof transform === 'function'
        ? transform
        : (value: unknown) => toDate(value);

    decorators.push(
      Transform(
        ({ value }) => {
          try {
            return transformFn(value);
          } catch {
            return value;
          }
        },
        { toClassOnly: true },
      ),
    );
  }

  decorators.push(
    IsDate(DecoratorFactory.createValidationOptions(options.errorKey)),
  );

  return DecoratorFactory.createPropertyDecorator(
    Date,
    decorators,
    baseOptions,
  );
}

export function ArrayProperty<T>(
  options: ArrayDecoratorOptions<T>,
): PropertyDecorator {
  const {
    type,
    minSize,
    maxSize,
    unique = false,
    itemTransform,
    ...baseOptions
  } = options;

  const decorators: PropertyDecorator[] = [];

  decorators.push(
    Transform(
      ({ value }) => {
        if (value === undefined || value === null) return value;
        const array = Array.isArray(value) ? value : [value];
        return itemTransform ? array.map(itemTransform) : array;
      },
      { toClassOnly: true },
    ),
  );

  if (!isPrimitiveType(type)) {
    decorators.push(Type(type as any));
  }

  decorators.push(
    IsArray(DecoratorFactory.createValidationOptions(options.errorKey)),
  );

  if (minSize !== undefined) decorators.push(ArrayMinSize(minSize));
  if (maxSize !== undefined) decorators.push(ArrayMaxSize(maxSize));
  if (unique) decorators.push(ArrayUnique());

  if (isPrimitiveType(type)) {
    const validator = getPrimitiveValidator(type);
    if (validator) decorators.push(validator);
  } else {
    decorators.push(ValidateNested({ each: true }));
  }

  return DecoratorFactory.createPropertyDecorator(
    [type],
    decorators,
    baseOptions,
  );
}

export function NestedProperty(
  options: NestedDecoratorOptions,
): PropertyDecorator {
  const { type, ...baseOptions } = options;
  const decorators: PropertyDecorator[] = [
    Type(type),
    ValidateNested(DecoratorFactory.createValidationOptions(options.errorKey)),
  ];

  return DecoratorFactory.createPropertyDecorator(
    type,
    decorators,
    baseOptions,
  );
}

function isPrimitiveType(type: any): boolean {
  return [String, Number, Boolean, Date].includes(type);
}

function getPrimitiveValidator(type: any): PropertyDecorator | null {
  const validationOptions = { each: true };
  const validatorMap: Record<string, () => PropertyDecorator> = {
    String: () => IsString(validationOptions),
    Number: () => IsNumber({}, validationOptions),
    Boolean: () => IsBoolean(validationOptions),
    Date: () => IsDate(validationOptions),
  };

  const validationFactory = validatorMap[type.name];
  return validationFactory ? validationFactory() : null;
}
