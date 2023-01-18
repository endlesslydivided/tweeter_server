import { ValidationError } from "@nestjs/common";
import { ValidationException } from "src/exceptions/types/validation.exception";

const  ValidationExceptionFactory = (errors: ValidationError[]) =>
    {
      let errorDescription = {};
      errors.map((entryErrors) =>
        {
          let entryProperty = entryErrors.property;
          Object.defineProperty(errorDescription,entryProperty,{value:[],enumerable:true});
          for (const key in entryErrors.constraints) 
          {
            if (entryErrors.constraints.hasOwnProperty(key)) 
            {
              let entryError = entryErrors.constraints[key];
              errorDescription[entryProperty].push(entryError);
            }
          }
        }
      );
      return new ValidationException(`Entity cannot be processed.`,errorDescription);
    }

export {ValidationExceptionFactory};