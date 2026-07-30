import { FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import { useField } from 'formik';

import { getVisibleFieldError } from './fieldError';
import { useFieldValidation } from './FieldValidationContext';
import { FormFieldHelper, getFormFieldHelperDescribedBy } from './FormFieldHelper';

interface InputFieldProps {
  name: string;
  label: string;
  fieldId: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  multiline?: boolean;
  rows?: number;
  resizeOrientation?: 'vertical' | 'horizontal' | 'both' | 'none';
  type?: 'text' | 'number' | 'password';
  helperText?: string;
  onBlur?: () => void;
}

export const InputField = ({
  name,
  label,
  fieldId,
  isRequired = false,
  isDisabled = false,
  multiline = false,
  rows,
  resizeOrientation,
  type = 'text',
  helperText,
  onBlur,
}: InputFieldProps) => {
  const [field, meta, { setValue }] = useField<string | number>(name);
  const { showErrors: showValidationErrors } = useFieldValidation();
  const error = getVisibleFieldError(meta, showValidationErrors);
  const validated = error ? 'error' : 'default';
  const helperDescribedBy = getFormFieldHelperDescribedBy(fieldId, error, helperText);

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired}>
      {multiline ? (
        <TextArea
          id={fieldId}
          name={name}
          value={field.value ?? ''}
          rows={rows}
          resizeOrientation={resizeOrientation}
          onChange={(_event, value) => {
            setValue(value);
          }}
          onBlur={(event) => {
            field.onBlur(event);
            onBlur?.();
          }}
          isDisabled={isDisabled}
          validated={validated}
          aria-invalid={error ? true : undefined}
          aria-describedby={helperDescribedBy}
        />
      ) : (
        <TextInput
          id={fieldId}
          name={name}
          type={type}
          value={field.value ?? ''}
          onChange={(_event, value) => {
            if (type === 'number') {
              setValue(Number(value));
            } else {
              setValue(value);
            }
          }}
          onBlur={(event) => {
            field.onBlur(event);
            onBlur?.();
          }}
          isDisabled={isDisabled}
          validated={validated}
          aria-invalid={error ? true : undefined}
          aria-describedby={helperDescribedBy}
        />
      )}
      <FormFieldHelper error={error} description={helperText} fieldId={fieldId} />
    </FormGroup>
  );
};
