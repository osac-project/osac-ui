import { useState } from 'react';
import { MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';

import { type CatalogPublishedFilter } from './catalogItemDisplay';
import { useTranslation } from '../../hooks/useTranslation';

const ALL_OPTION_VALUE = '__all__';

interface CatalogPublishedStatusFilterProps {
  selected: CatalogPublishedFilter | undefined;
  onChange: (value: CatalogPublishedFilter | undefined) => void;
}

const CatalogPublishedStatusFilter = ({
  selected,
  onChange,
}: CatalogPublishedStatusFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const options: ReadonlyArray<{ value: CatalogPublishedFilter; label: string }> = [
    { value: 'published', label: t('Published') },
    { value: 'unpublished', label: t('Unpublished') },
  ];
  const allLabel = t('All publish states');
  const selectedLabel = options.find((option) => option.value === selected)?.label ?? allLabel;

  return (
    <Select
      isOpen={isOpen}
      selected={selected ?? ALL_OPTION_VALUE}
      onOpenChange={setIsOpen}
      onSelect={(_event, value) => {
        onChange(value === ALL_OPTION_VALUE ? undefined : (value as CatalogPublishedFilter));
        setIsOpen(false);
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((open) => !open)}
          isExpanded={isOpen}
          aria-label={t('Filter catalog by publication status')}
        >
          {selectedLabel}
        </MenuToggle>
      )}
    >
      <SelectList>
        <SelectOption value={ALL_OPTION_VALUE} isSelected={selected === undefined}>
          {allLabel}
        </SelectOption>
        {options.map((option) => (
          <SelectOption
            key={option.value}
            value={option.value}
            isSelected={selected === option.value}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default CatalogPublishedStatusFilter;
