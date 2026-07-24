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

import { useClusterTemplates } from '@osac/ui-components/api/v1/cluster-templates';

import { buildClusterCreatePayload } from './payload';
import ClusterConfigurationStep from './steps/ClusterConfigurationStep';
import ClusterGeneralStep from './steps/ClusterGeneralStep';
import ClusterNetworkingStep from './steps/ClusterNetworkingStep';
import { ClusterReview } from './steps/ClusterReview';
import { buildFullClusterSchema, clusterStepHasErrors } from './validation';
import { type ClusterWizardValues, buildClusterInitialValues } from './values';
import { useProvisionCluster } from '../../../api/v1/cluster';
import { useClusterCatalogItems } from '../../../api/v1/cluster-catalog-item';
import { useTranslation } from '../../../hooks/useTranslation';
import { CatalogStepContent } from '../../catalogProvision/shared/CatalogStepContent';
import { FieldValidationProvider } from '../../Form/FieldValidationContext';
import { LeaveFormConfirmation } from '../../Form/LeaveFormConfirmation';
import { OSACWizardFooter } from '../../Wizard/OSACWizardFooter';

const ClusterCreateWizard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { catalogItemId } = useParams<{ catalogItemId?: string }>();
  const { data: catalogItems = [], isLoading, error, refetch } = useClusterCatalogItems();
  const provisionCluster = useProvisionCluster();
  const [currentStep, setCurrentStep] = useState<WizardStepType>();

  const { data: clusterTemplates, isLoading: templatesLoading } = useClusterTemplates();

  const initialItem = catalogItemId
    ? catalogItems.find((item) => item.id === catalogItemId)
    : undefined;

  if ((catalogItemId && isLoading) || templatesLoading) {
    return (
      <Bullseye>
        <Spinner aria-label={t('Loading catalog')} />
      </Bullseye>
    );
  }

  const initialValues = buildClusterInitialValues(initialItem, clusterTemplates);

  const onSubmit = async (
    values: ClusterWizardValues,
    helpers: { setStatus: (status: unknown) => void },
  ) => {
    try {
      const cluster = await provisionCluster.mutateAsync(buildClusterCreatePayload(values));
      navigate(`/clusters/${cluster?.id}`);
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
      validationSchema={buildFullClusterSchema(t)}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <>
          <PageSection hasBodyWrapper={false}>
            <Stack hasGutter>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Button variant="link" isInline onClick={() => navigate('/clusters')}>
                    {t('Clusters')}
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{t('Create cluster')}</BreadcrumbItem>
              </Breadcrumb>
              <Title headingLevel="h1" size="3xl">
                {t('Create cluster')}
              </Title>
              <Content component="p">
                {t('Select a catalog item, configure, and provision an OpenShift cluster.')}
              </Content>
            </Stack>
          </PageSection>
          <FieldValidationProvider>
            <LeaveFormConfirmation />
            <PageSection
              hasBodyWrapper={false}
              type={PageSectionTypes.wizard}
              aria-label={t('Create cluster wizard')}
            >
              <Wizard
                navAriaLabel={t('Create cluster steps')}
                isVisitRequired
                footer={
                  <OSACWizardFooter
                    onCancel={() => navigate('/clusters')}
                    stepHasErrors={clusterStepHasErrors}
                  />
                }
                onStepChange={(_, step) => {
                  setCurrentStep(step);
                }}
              >
                <WizardStep id="catalog" name={t('Catalog')}>
                  {(!currentStep || currentStep?.id === 'catalog') && (
                    <CatalogStepContent
                      catalogItems={catalogItems}
                      error={error}
                      onRefetch={() => void refetch()}
                      onSelect={(item) => {
                        formik.resetForm({
                          values: buildClusterInitialValues(item, clusterTemplates),
                        });
                      }}
                    />
                  )}
                </WizardStep>
                <WizardStep id="general" name={t('General')}>
                  {currentStep?.id === 'general' && <ClusterGeneralStep />}
                </WizardStep>
                <WizardStep id="configuration" name={t('Configuration')}>
                  {currentStep?.id === 'configuration' && <ClusterConfigurationStep />}
                </WizardStep>
                <WizardStep id="networking" name={t('Networking')}>
                  {currentStep?.id === 'networking' && <ClusterNetworkingStep />}
                </WizardStep>
                <WizardStep id="review" name={t('Review')}>
                  {currentStep?.id === 'review' && <ClusterReview />}
                </WizardStep>
              </Wizard>
            </PageSection>
          </FieldValidationProvider>
        </>
      )}
    </Formik>
  );
};

export default ClusterCreateWizard;
