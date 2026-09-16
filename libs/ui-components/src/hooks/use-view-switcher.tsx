import { ReactNode, useMemo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import ListIcon from '@patternfly/react-icons/dist/esm/icons/list-icon';
import ThIcon from '@patternfly/react-icons/dist/esm/icons/th-icon';

import { usePageFilter } from '@osac/ui-components/hooks/use-page-filter';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

export const VIEW_TYPE_PARAM = 'viewType';

export type ViewType = 'cards' | 'list';

export const isViewType = (value: string): value is ViewType =>
  value === 'cards' || value === 'list';

export const useViewType = (): [ViewType, ReactNode] => {
  const { t } = useTranslation();
  const [viewTypeParam, setViewTypeParam] = usePageFilter(VIEW_TYPE_PARAM);
  const viewType = isViewType(viewTypeParam) ? viewTypeParam : 'cards';

  const ViewSwitcher = useMemo(() => {
    return (
      <ToggleGroup aria-label={t('Toggle view type')}>
        <ToggleGroupItem
          icon={<ThIcon />}
          aria-label={t('Card view')}
          buttonId="card-view"
          isSelected={viewType === 'cards'}
          onChange={() => setViewTypeParam('cards')}
        />
        <ToggleGroupItem
          icon={<ListIcon />}
          aria-label={t('List view')}
          buttonId="list-view"
          isSelected={viewType === 'list'}
          onChange={() => setViewTypeParam('list')}
        />
      </ToggleGroup>
    );
  }, [setViewTypeParam, t, viewType]);

  return [viewType, ViewSwitcher];
};
