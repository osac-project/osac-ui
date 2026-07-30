import type { FieldDefinition } from '@osac/types';

export const getFieldDefinition = (path: string, fieldDefinitions: FieldDefinition[]) => {
  return fieldDefinitions.find((fd) => fd.path === path);
};

export const getStringDefaultValue = (path: string, fieldDefinitions: FieldDefinition[]) => {
  const defaultValue = getFieldDefinition(path, fieldDefinitions)?.default;
  if (defaultValue?.kind.case !== 'stringValue') {
    return undefined;
  }

  return defaultValue.kind.value;
};

export const getNumberDefaultValue = (path: string, fieldDefinitions: FieldDefinition[]) => {
  const defaultValue = getFieldDefinition(path, fieldDefinitions)?.default;
  if (defaultValue?.kind.case !== 'numberValue') {
    return undefined;
  }

  return defaultValue.kind.value;
};

export const isFieldEditable = (path: string, fieldDefinitions: FieldDefinition[]): boolean => {
  if (!path) {
    return false;
  }
  const parts = path.split('.');
  let editable = false;
  for (let i = 1; i <= parts.length; i++) {
    const fd = getFieldDefinition(parts.slice(0, i).join('.'), fieldDefinitions);
    if (fd) {
      if (fd.editable === false) {
        return false;
      }
      editable = fd.editable === true;
    }
  }
  return editable;
};
