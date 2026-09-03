import { Alert } from '@patternfly/react-core';

import { Projects } from '@osac/types';
import { useListResource } from '@osac/ui-components/api/use-resource';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';
import { getErrorMessage } from '@osac/ui-components/utils/error';

import { SelectField } from './SelectField';
import { getFullProjectPath, getProjectName } from '../Project/utils';

interface ProjectFieldProps {
  label?: string;
}

const ProjectField = ({ label }: ProjectFieldProps) => {
  const { t } = useTranslation();
  const {
    data: projects,
    isLoading,
    error,
  } = useListResource(Projects, { filter: 'this.metadata.tenant != "shared"' });
  return (
    <>
      <SelectField
        fieldId="metadata.project"
        label={label || t('Project')}
        name="metadata.project"
        options={(projects?.items || []).map((p) => ({
          label: getProjectName(p, t),
          value: getFullProjectPath(p),
        }))}
        isRequired
        isLoading={isLoading}
        isDisabled={!!error}
      />
      {error && (
        <Alert variant="danger" title={t('Failed to fetch projects')}>
          {getErrorMessage(error)}
        </Alert>
      )}
    </>
  );
};

export default ProjectField;
