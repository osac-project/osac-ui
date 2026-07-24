import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Flex,
  Stack,
  StackItem,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
import type { FormikErrors } from 'formik';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import { useFieldValidation } from '../Form/FieldValidationContext';

interface OSACWizardFooterProps {
  onCancel: () => void;
  stepHasErrors: (stepId: string, errors: FormikErrors<unknown>) => boolean;
}

export const OSACWizardFooter = ({ onCancel, stepHasErrors }: OSACWizardFooterProps) => {
  const { t } = useTranslation();
  const { activeStep, goToStepByIndex, steps } = useWizardContext();
  const formik = useFormikContext();
  const { setShowErrors } = useFieldValidation();
  const [validationAlert, setValidationAlert] = useState(false);

  const stepIndex = activeStep?.index ?? 1;
  const isFirst = stepIndex <= 1;
  const isLast = stepIndex >= steps.length;
  const provisionError = (formik.status as { provisionError?: string } | undefined)?.provisionError;

  useEffect(() => {
    setValidationAlert(false);
    setShowErrors(false);
  }, [activeStep.id, setShowErrors]);

  const handleBack = useCallback(() => {
    if (isFirst || formik.isSubmitting) {
      return;
    }
    goToStepByIndex(stepIndex - 1);
  }, [goToStepByIndex, isFirst, formik.isSubmitting, stepIndex]);

  const handleNextOrCreate = useCallback(async () => {
    if (formik.isSubmitting) {
      return;
    }
    if (isLast) {
      void formik.setStatus(undefined);
      await formik.submitForm();
      return;
    }
    const errors = await formik.validateForm();

    if (stepHasErrors(String(activeStep.id), errors)) {
      setValidationAlert(true);
      setShowErrors(true);
      return;
    }
    setValidationAlert(false);
    setShowErrors(false);
    goToStepByIndex(stepIndex + 1);
  }, [activeStep.id, formik, goToStepByIndex, isLast, setShowErrors, stepHasErrors, stepIndex]);

  return (
    <WizardFooterWrapper>
      <Stack hasGutter>
        {validationAlert ? (
          <StackItem>
            <Alert
              variant="danger"
              isInline
              title={t('Fix the highlighted errors before continuing.')}
            />
          </StackItem>
        ) : null}
        {provisionError ? (
          <StackItem>
            <Alert variant="danger" isInline title={t('Failed to create resource')}>
              {provisionError}
            </Alert>
          </StackItem>
        ) : null}
        <StackItem>
          <Flex
            justifyContent={{ default: 'justifyContentFlexStart' }}
            alignItems={{ default: 'alignItemsCenter' }}
            flexWrap={{ default: 'wrap' }}
            gap={{ default: 'gapMd' }}
          >
            <Button
              variant="secondary"
              onClick={handleBack}
              isDisabled={isFirst || formik.isSubmitting}
              isAriaDisabled={isFirst || formik.isSubmitting}
            >
              {t('Back')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleNextOrCreate()}
              isDisabled={formik.isSubmitting}
              isLoading={formik.isSubmitting}
            >
              {isLast ? t('Create') : t('Next')}
            </Button>
            <Button variant="link" onClick={onCancel} isDisabled={formik.isSubmitting}>
              {t('Cancel')}
            </Button>
          </Flex>
        </StackItem>
      </Stack>
    </WizardFooterWrapper>
  );
};
