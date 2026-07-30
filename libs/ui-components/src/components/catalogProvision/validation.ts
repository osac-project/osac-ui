import Ajv, { type ValidateFunction } from 'ajv';
import * as Yup from 'yup';

import { type FieldDefinition } from '@osac/types';

import { getFieldDefinition, isFieldEditable } from './utils';

const ajv = new Ajv();
const schemaCache = new Map<string, ValidateFunction>();

const compileSchema = (schemaStr: string): ValidateFunction | undefined => {
  let compiled = schemaCache.get(schemaStr);
  if (compiled) {
    return compiled;
  }
  try {
    compiled = ajv.compile(JSON.parse(schemaStr) as Record<string, unknown>);
    schemaCache.set(schemaStr, compiled);
    return compiled;
  } catch {
    return undefined;
  }
};

export const clearSchemaCache = () => {
  schemaCache.clear();
  ajv.removeSchema();
};

const getNestedValue = (obj: unknown, path: string): unknown => {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

const validateFieldDefinition = (
  path: string,
  snakeSpec: Record<string, unknown>,
  fieldDefinitions: FieldDefinition[],
  yupContext: Yup.TestContext,
): true | Yup.ValidationError => {
  const fd = getFieldDefinition(path, fieldDefinitions);
  if (!fd?.editable || !fd.validationSchema) {
    return true;
  }

  const validate = compileSchema(fd.validationSchema);
  if (!validate) {
    return true;
  }
  const value = getNestedValue(snakeSpec, path);

  if (validate(value)) {
    return true;
  }

  const firstError = validate.errors?.[0];
  const message = firstError
    ? `${firstError.instancePath || path} ${firstError.message}`
    : 'Validation failed';

  return yupContext.createError({ message });
};

export const buildFieldSchema = (snakeSpec: Record<string, unknown>, fds: FieldDefinition[]) => {
  return (path: string, baseSchema: Yup.Schema = Yup.mixed()) => {
    if (!isFieldEditable(path, fds)) {
      return Yup.mixed();
    }
    return baseSchema.test(`fd-${path}`, '', function () {
      return validateFieldDefinition(path, snakeSpec, fds, this);
    });
  };
};
