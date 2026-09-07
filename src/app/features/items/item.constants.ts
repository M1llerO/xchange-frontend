import { ItemCondition } from '../../models/item.model';

/** Opzioni per i menu a tendina: valore inviato al backend + etichetta mostrata in UI. */
export const CONDITION_OPTIONS: ReadonlyArray<{ value: ItemCondition; label: string }> = [
  { value: 'nuovo', label: 'Nuovo' },
  { value: 'come_nuovo', label: 'Come nuovo' },
  { value: 'ottime', label: 'Ottime condizioni' },
  { value: 'buone', label: 'Buone condizioni' },
  { value: 'discrete', label: 'Condizioni discrete' },
  { value: 'da_riparare', label: 'Da riparare' }
];

/** Mappa valore -> etichetta, comoda per mostrare la condizione di un oggetto gia' salvato. */
export const CONDITION_LABELS: Record<ItemCondition, string> = CONDITION_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<ItemCondition, string>
);
