import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Formik } from 'formik';

import { ProjectMembershipRole, ProjectMemberships, Projects } from '@osac/types';
import {
  useCreateResource,
  useGetResource,
  useUpdateResource,
} from '@osac/ui-components/api/use-resource';
import { useUsers } from '@osac/ui-components/api/v1/user';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';
import { getErrorMessage } from '@osac/ui-components/utils/error';

import { getCreateProjectMembershipPayload, getUpdateProjectMembershipPayload } from './payload';
import { getProjectMembershipValidationSchema } from './validation';
import { getInitialValues } from './values';
import NameField from '../../catalogProvision/wizard/fields/NameField';
import LeaveFormConfirmation from '../../Form/LeaveFormConfirmation';
import { MultiSelectField } from '../../Form/MultiSelectField';
import OsacForm from '../../Form/OsacForm';
import { SelectField } from '../../Form/SelectField';
import { getFullProjectPath, getProjectName } from '../../Project/utils';
import { getRoleLabel } from '../utils';

const ProjectMembershipCreatePage = () => {
  const { projectId, pmId } = useParams() as { projectId?: string; pmId?: string };
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutateAsync: create, error: createErr } = useCreateResource(ProjectMemberships);
  const { mutateAsync: update, error: updateErr } = useUpdateResource(ProjectMemberships);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectErr,
  } = useGetResource(Projects, { id: projectId }, { enabled: !!projectId });
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const {
    data: pm,
    isLoading: pmLoading,
    error: pmError,
  } = useGetResource(ProjectMemberships, { id: pmId }, { enabled: !!pmId });

  const roles = getRoleLabel(t);

  if (projectLoading || pmLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (projectErr) {
    return (
      <Alert variant="danger" isInline title={t('Failed to load project')}>
        {getErrorMessage(projectErr)}
      </Alert>
    );
  }

  if (pmError) {
    return (
      <Alert variant="danger" isInline title={t('Failed to load project membership')}>
        {getErrorMessage(pmError)}
      </Alert>
    );
  }

  if (!project?.object) {
    return <Alert variant="danger" isInline title={t('Failed to load project')} />;
  }

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <Breadcrumb>
            <BreadcrumbItem>
              <Button variant="link" isInline onClick={() => navigate('/projects')}>
                {t('Projects')}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Button variant="link" isInline onClick={() => navigate(`/projects/${projectId}`)}>
                {project && getProjectName(project.object, t)}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>
              {pmId ? t('Edit project membership') : t('Create project membership')}
            </BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {pmId ? t('Edit project membership') : t('Create project membership')}
          </Title>
        </Stack>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Formik
          initialValues={getInitialValues(pm?.object)}
          validationSchema={getProjectMembershipValidationSchema(t)}
          onSubmit={async (values) => {
            try {
              if (pmId) {
                await update({
                  object: {
                    id: pmId,
                    ...getUpdateProjectMembershipPayload(values),
                  },
                });
              } else {
                await create({
                  object: getCreateProjectMembershipPayload(
                    values,
                    getFullProjectPath(project.object),
                  ),
                });
              }
              navigate(`/projects/${projectId}`);
            } catch {
              // tanstack handles the err
            }
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <>
              <LeaveFormConfirmation />
              <Stack hasGutter>
                <StackItem>
                  <OsacForm>
                    <NameField isDisabled={!!pmId} />

                    <MultiSelectField
                      fieldId="users"
                      label={t('Users')}
                      name="users"
                      options={users.map((user) => ({
                        label: user.spec?.username || user.metadata?.name || user.id,
                        value: user.metadata?.name || user.id,
                      }))}
                      isLoading={usersLoading}
                      isDisabled={!!usersError}
                    />
                    {!!usersError && (
                      <Alert variant="danger" isInline title={t('Failed to load users')}>
                        {getErrorMessage(usersError)}
                      </Alert>
                    )}
                    <SelectField
                      fieldId="role"
                      label={t('Role')}
                      name="role"
                      options={[
                        {
                          label: roles[ProjectMembershipRole.VIEWER],
                          value: ProjectMembershipRole.VIEWER,
                        },
                        {
                          label: roles[ProjectMembershipRole.MANAGER],
                          value: ProjectMembershipRole.MANAGER,
                        },
                      ]}
                    />
                  </OsacForm>
                </StackItem>

                {!!createErr && (
                  <StackItem>
                    <Alert
                      variant="danger"
                      title={t('Failed to create project membership')}
                      isInline
                    >
                      {getErrorMessage(createErr)}
                    </Alert>
                  </StackItem>
                )}
                {!!updateErr && (
                  <StackItem>
                    <Alert
                      variant="danger"
                      title={t('Failed to update project membership')}
                      isInline
                    >
                      {getErrorMessage(updateErr)}
                    </Alert>
                  </StackItem>
                )}
                <StackItem>
                  <ActionList>
                    <ActionListGroup>
                      <ActionListItem>
                        <Button
                          variant="primary"
                          onClick={submitForm}
                          isDisabled={isSubmitting}
                          isLoading={isSubmitting}
                        >
                          {pmId ? t('Edit') : t('Create')}
                        </Button>
                      </ActionListItem>
                      <ActionListItem>
                        <Button
                          variant="link"
                          onClick={() => navigate(`/projects/${projectId}`)}
                          isDisabled={isSubmitting}
                        >
                          {t('Cancel')}
                        </Button>
                      </ActionListItem>
                    </ActionListGroup>
                  </ActionList>
                </StackItem>
              </Stack>
            </>
          )}
        </Formik>
      </PageSection>
    </>
  );
};

export default ProjectMembershipCreatePage;
