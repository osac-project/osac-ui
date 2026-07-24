import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  Content,
  PageSection,
  PageSectionTypes,
  Spinner,
  Title,
  Wizard,
  WizardStep,
  WizardStepType,
} from '@patternfly/react-core';
import { Formik } from 'formik';

import { useProvisionComputeInstance } from '@osac/ui-components/api/v1/compute-instance';
import { useComputeInstanceCatalogItems } from '@osac/ui-components/api/v1/compute-instance-catalog-item';

import { buildComputeInstanceCreatePayload } from './payload';
import { buildFullVmSchema, vmStepHasErrors } from './schemas';
import { VmConfigurationStep } from './steps/VmConfigurationStep';
import VmGeneralStep from './steps/VmGeneralStep';
import { VmNetworkingStep } from './steps/VmNetworkingStep';
import { VmReview } from './steps/VmReview';
import { type ComputeInstanceWizardValues, buildVmInitialValues } from './values';
import { useTranslation } from '../../../hooks/useTranslation';
import { CatalogStepContent } from '../../catalogProvision/shared/CatalogStepContent';
import { FieldValidationProvider } from '../../Form/FieldValidationContext';
import { LeaveFormConfirmation } from '../../Form/LeaveFormConfirmation';
import { OSACWizardFooter } from '../../Wizard/OSACWizardFooter';

const ComputeInstanceProvisionWizard = () => {
  const navigate = useNavigate();
  const { catalogItemId } = useParams<{ catalogItemId?: string }>();
  const { t } = useTranslation();
  const { data: catalogItems = [], isLoading, error, refetch } = useComputeInstanceCatalogItems();
  const provisionVm = useProvisionComputeInstance();
  const [currentStep, setCurrentStep] = useState<WizardStepType>();

  const initialItem = catalogItemId
    ? catalogItems.find((item) => item.id === catalogItemId)
    : undefined;

  if (catalogItemId && isLoading) {
    return (
      <Bullseye>
        <Spinner aria-label={t('Loading catalog')} />
      </Bullseye>
    );
  }

  const initialValues = buildVmInitialValues(initialItem);

  const onSubmit = async (
    values: ComputeInstanceWizardValues,
    helpers: { setStatus: (status: unknown) => void },
  ) => {
    try {
      const result = await provisionVm.mutateAsync(buildComputeInstanceCreatePayload(values));
      navigate(`/vms/${result?.id}`);
    } catch (err) {
      helpers.setStatus({
        provisionError:
          err instanceof Error ? err.message : t('Provisioning failed. Please try again.'),
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={buildFullVmSchema(t)}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <>
          <PageSection hasBodyWrapper={false}>
            <Breadcrumb>
              <BreadcrumbItem>
                <Button variant="link" isInline onClick={() => navigate('/vms')}>
                  {t('Virtual Machines')}
                </Button>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{t('Create')}</BreadcrumbItem>
            </Breadcrumb>
            <Title headingLevel="h1" size="3xl">
              {t('Create virtual machine')}
            </Title>
            <Content component="p">{t('Select a catalog item, configure, and provision.')}</Content>
          </PageSection>
          <FieldValidationProvider>
            <LeaveFormConfirmation />
            <PageSection hasBodyWrapper={false} type={PageSectionTypes.wizard}>
              <Wizard
                navAriaLabel={t('Create virtual machine steps')}
                isVisitRequired
                footer={
                  <OSACWizardFooter
                    onCancel={() => navigate('/vms')}
                    stepHasErrors={vmStepHasErrors}
                  />
                }
                onStepChange={(_, step) => {
                  setCurrentStep(step);
                }}
              >
                <WizardStep id="catalog" name={t('Catalog')}>
                  {(!currentStep || currentStep.id === 'catalog') && (
                    <CatalogStepContent
                      catalogItems={catalogItems}
                      error={error}
                      onRefetch={() => void refetch()}
                      onSelect={(item) => {
                        formik.resetForm({ values: buildVmInitialValues(item) });
                      }}
                    />
                  )}
                </WizardStep>
                <WizardStep id="general" name={t('General')}>
                  {currentStep?.id === 'general' && <VmGeneralStep />}
                </WizardStep>
                <WizardStep id="configuration" name={t('Configuration')}>
                  {currentStep?.id === 'configuration' && <VmConfigurationStep />}
                </WizardStep>
                <WizardStep id="networking" name={t('Networking')}>
                  {currentStep?.id === 'networking' && <VmNetworkingStep />}
                </WizardStep>
                <WizardStep id="review" name={t('Review')}>
                  {currentStep?.id === 'review' && <VmReview />}
                </WizardStep>
              </Wizard>
            </PageSection>
          </FieldValidationProvider>
        </>
      )}
    </Formik>
  );
};

export default ComputeInstanceProvisionWizard;
