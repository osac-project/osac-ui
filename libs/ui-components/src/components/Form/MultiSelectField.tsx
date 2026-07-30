import { useEffect, useMemo, useRef } from 'react';
import { FormGroup } from '@patternfly/react-core';
import { MultiTypeaheadSelect, type MultiTypeaheadSelectOption } from '@patternfly/react-templates';
import { useField } from 'formik';

import { getVisibleFieldError } from './fieldError';
import { useFieldValidation } from './FieldValidationContext';
import { FormFieldHelper } from './FormFieldHelper';
import type { SelectFieldOption } from './SelectField';

interface MultiSelectFieldProps {
  name: string;
  label: string;
  fieldId: string;
  options: SelectFieldOption[];
  isRequired?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  loadingPlaceholder?: string;
  noOptionsFoundMessage?: string | ((filter: string) => string);
  /** When true, commits the sole option to Formik once loading finishes and exactly one option exists. */
  autoSelectSingleOption?: boolean;
}

export const MultiSelectField = ({
  name,
  label,
  fieldId,
  options,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  placeholder = 'Select options',
  loadingPlaceholder = 'Loading...',
  noOptionsFoundMessage = (filter) => `No options found for "${filter}"`,
  autoSelectSingleOption = false,
}: MultiSelectFieldProps) => {
  const [field, meta, helpers] = useField<(string | number)[] | undefined>(name);
  const { showErrors: showValidationErrors } = useFieldValidation();
  const error = getVisibleFieldError(meta, showValidationErrors);
  const validated = error ? 'error' : 'default';
  const effectivePlaceholder = isLoading ? loadingPlaceholder : placeholder;
  const controlDisabled = isDisabled || isLoading;

  const defaultSelectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (
      defaultSelectedRef.current ||
      !autoSelectSingleOption ||
      isLoading ||
      isDisabled ||
      options.length !== 1 ||
      (field.value?.length || 0) > 0
    ) {
      return;
    }
    defaultSelectedRef.current = true;
    void helpers.setValue([options[0].value], false);
  }, [autoSelectSingleOption, helpers, isDisabled, isLoading, options, field.value?.length]);

  const initialOptions = useMemo<MultiTypeaheadSelectOption[]>(() => {
    return options.map((option) => ({
      content: option.label,
      value: option.value,
      selected: field.value?.some((value) => value === option.value),
      isDisabled: option.isDisabled,
    }));
  }, [options, field.value]);

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired={isRequired}>
      <MultiTypeaheadSelect
        id={fieldId}
        initialOptions={initialOptions}
        placeholder={effectivePlaceholder}
        isDisabled={controlDisabled}
        noOptionsFoundMessage={noOptionsFoundMessage}
        onSelectionChange={(_event, selections) => {
          void helpers.setValue(selections, true);
          void helpers.setTouched(true);
        }}
        onToggle={(open) => {
          if (!open) {
            void helpers.setTouched(true);
          }
        }}
        toggleProps={{
          id: fieldId,
          'aria-label': label,
          isFullWidth: true,
          status: validated === 'error' ? 'danger' : undefined,
          'aria-busy': isLoading || undefined,
        }}
      />
      <FormFieldHelper error={error} fieldId={fieldId} />
    </FormGroup>
  );
};
