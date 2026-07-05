import { Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CombinedPaginate } from '../dto/combined-paginate.dto';
import { PaginateOutputDto } from '../dto/paginate-output.dto';

export const ApiCombinedPaginateResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return (
    target: object,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    ApiExtraModels(CombinedPaginate, PaginateOutputDto, model)(
      target,
      propertyKey,
      descriptor,
    );
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(CombinedPaginate) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })(target, propertyKey!, descriptor!);
  };
};
