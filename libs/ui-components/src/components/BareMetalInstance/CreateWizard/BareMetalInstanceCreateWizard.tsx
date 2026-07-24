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
  Stack,
  Title,
  Wizard,
  WizardStep,
  WizardStepType,
} from '@patternfly/react-core';
import { Formik } from 'formik';

import { BareMetalInstanceCatalogItem } from '@osac/types';

import { buildBmCreatePayload } from './payload';
import BareMetalConfigurationStep from './steps/BareMetalConfigurationStep';
import BareMetalGeneralStep from './steps/BareMetalGeneralStep';
import { BareMetalReview } from './steps/BareMetalReview';
import { bmStepHasErrors, buildFullBmSchema } from './validation';
import { type BareMetalInstanceWizardValues, buildBmInitialValues } from './values';
import {
  useBareMetalInstanceCatalogItems,
  useCreateBareMetalInstance,
} from '../../../api/v1/baremetal-instance';
import { useTranslation } from '../../../hooks/useTranslation';
import { CatalogStepContent } from '../../catalogProvision/shared/CatalogStepContent';
import { FieldValidationProvider } from '../../Form/FieldValidationContext';
import { LeaveFormConfirmation } from '../../Form/LeaveFormConfirmation';
import { OSACWizardFooter } from '../../Wizard/OSACWizardFooter';

export const BareMetalInstanceCreateWizard = () => {
  const { t } = useTranslation();
  const { catalogItemId } = useParams<{ catalogItemId?: string }>();
  const { data: catalogItems = [], isLoading, error, refetch } = useBareMetalInstanceCatalogItems();

  const navigate = useNavigate();
  const createBareMetalInstance = useCreateBareMetalInstance();
  const [currentStep, setCurrentStep] = useState<WizardStepType>();

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner aria-label={t('Loading catalog')} />
      </Bullseye>
    );
  }

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

  const initialValues = buildBmInitialValues(initialItem);

  const onSubmit = async (
    values: BareMetalInstanceWizardValues,
    helpers: { setStatus: (status: unknown) => void },
  ) => {
    try {
      const instance = await createBareMetalInstance.mutateAsync(buildBmCreatePayload(values));
      navigate(`/bare-metal/${instance?.id}`);
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
      validationSchema={buildFullBmSchema(t)}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <>
          <PageSection hasBodyWrapper={false}>
            <Stack hasGutter>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Button variant="link" isInline onClick={() => navigate('/bare-metal')}>
                    {t('Bare Metal')}
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{t('Provision bare metal')}</BreadcrumbItem>
              </Breadcrumb>
              <Title headingLevel="h1" size="3xl">
                {t('Provision bare metal')}
              </Title>
              <Content component="p">
                {t('Provision a bare metal instance from a catalog item.')}
              </Content>
            </Stack>
          </PageSection>
          <FieldValidationProvider>
            <LeaveFormConfirmation />
            <PageSection
              hasBodyWrapper={false}
              type={PageSectionTypes.wizard}
              aria-label={t('Bare metal provisioning wizard')}
            >
              <Wizard
                navAriaLabel={t('Provision bare metal steps')}
                isVisitRequired
                footer={
                  <OSACWizardFooter
                    onCancel={() => navigate('/bare-metal')}
                    stepHasErrors={bmStepHasErrors}
                  />
                }
                onStepChange={(_, step) => {
                  setCurrentStep(step);
                }}
              >
                <WizardStep id="catalog" name={t('Catalog')}>
                  {(!currentStep || currentStep?.id === 'catalog') && (
                    <CatalogStepContent<BareMetalInstanceCatalogItem>
                      catalogItems={catalogItems}
                      error={error}
                      onRefetch={() => void refetch()}
                      onSelect={(item) => {
                        formik.resetForm({ values: buildBmInitialValues(item) });
                      }}
                    />
                  )}
                </WizardStep>
                <WizardStep id="general" name={t('General')}>
                  {currentStep?.id === 'general' && <BareMetalGeneralStep />}
                </WizardStep>
                <WizardStep id="configuration" name={t('Configuration')}>
                  {currentStep?.id === 'configuration' && <BareMetalConfigurationStep />}
                </WizardStep>
                <WizardStep id="review" name={t('Review')}>
                  {currentStep?.id === 'review' && <BareMetalReview />}
                </WizardStep>
              </Wizard>
            </PageSection>
          </FieldValidationProvider>
        </>
      )}
    </Formik>
  );
};

export default BareMetalInstanceCreateWizard;
