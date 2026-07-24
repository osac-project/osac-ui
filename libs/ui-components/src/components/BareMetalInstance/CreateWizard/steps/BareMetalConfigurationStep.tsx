import { useFormikContext } from 'formik';
import { TFunction } from 'i18next';

import UserDataField from '@osac/ui-components/components/catalogProvision/UserDataField';
import { isFieldEditable } from '@osac/ui-components/components/catalogProvision/utils';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';
import { SelectField } from '@osac/ui-components/components/Form/SelectField';

import { useTranslation } from '../../../../hooks/useTranslation';
import { BareMetalInstanceWizardValues } from '../values';

export const runStrategies = (t: TFunction) => [
  {
    label: t('Always'),
    value: 1,
  },
  {
    label: t('Halted'),
    value: 2,
  },
  {
    label: t('Unspecified'),
    value: 0,
  },
];

const BareMetalConfigurationStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<BareMetalInstanceWizardValues>();

  if (!values.catalogItem) {
    return null;
  }

  const runStrategyEditable = isFieldEditable('run_strategy', values.catalogItem.fieldDefinitions);
  return (
    <OsacForm>
      <SelectField
        name={'spec.runStrategy'}
        fieldId={'spec-run-strategy'}
        label={t('Run strategy')}
        options={runStrategies(t)}
        autoSelectSingleOption={runStrategyEditable}
        isDisabled={!runStrategyEditable}
      />
      <UserDataField fieldDefinitions={values.catalogItem.fieldDefinitions} />
    </OsacForm>
  );
};

export default BareMetalConfigurationStep;
