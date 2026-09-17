import { useMemo, useState } from 'react';
import { MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';

import { type Tenant } from '@osac/types/private';

import { GLOBAL_TENANT_VALUE } from './catalogItemDisplay';
import { useTranslation } from '../../hooks/useTranslation';

interface OptionEntry {
  value: string;
  label: string;
}

const tenantSorter = (a: OptionEntry, b: OptionEntry) => {
  if (a.value === GLOBAL_TENANT_VALUE) {
    return -1;
  }
  if (b.value === GLOBAL_TENANT_VALUE) {
    return 1;
  }
  return a.label.localeCompare(b.label);
};

interface CatalogTenantFilterProps {
  tenants?: Tenant[];
  selected: string | undefined;
  onChange: (value: string | undefined) => void;
}

const CatalogTenantFilter = ({ tenants = [], selected, onChange }: CatalogTenantFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const selection = selected || GLOBAL_TENANT_VALUE;

  const options = useMemo<ReadonlyArray<OptionEntry>>(
    () =>
      tenants
        .map((tenant) => ({
          value: tenant.id,
          label: tenant.id === GLOBAL_TENANT_VALUE ? t('All tenants') : tenant.metadata?.name || '',
        }))
        .sort(tenantSorter),
    [tenants, t],
  );

  const selectedLabel = options.find((option) => option.value === selection)?.label;

  return (
    <Select
      isOpen={isOpen}
      selected={selection}
      onOpenChange={setIsOpen}
      onSelect={(_event, value: string) => {
        onChange(value === GLOBAL_TENANT_VALUE ? undefined : value);
        setIsOpen(false);
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          aria-label={t('Filter catalog by tenant')}
        >
          {selectedLabel}
        </MenuToggle>
      )}
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption
            key={option.value}
            value={option.value}
            isSelected={selection === option.value}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default CatalogTenantFilter;
