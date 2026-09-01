export type ItemCondition = 'nuovo' | 'come_nuovo' | 'ottime' | 'buone' | 'discrete' | 'da_riparare';

export interface ItemImageDto {
  id: number;
  itemId: number;
  url: string;
  displayOrder: number;
  createdAt: string;
}

export interface ItemDto {
  id: number;
  ownerId: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  estimatedValue: number | null;
  itemCondition: ItemCondition;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  images: ItemImageDto[];
}

export interface CreateItemRequest {
  categoryId: number;
  title: string;
  description: string;
  estimatedValue?: number;
  itemCondition: ItemCondition;
}

export interface UpdateItemRequest extends CreateItemRequest {
  archived: boolean;
}

export interface ItemQueryParams {
  categoryId?: number;
  condition?: ItemCondition;
  minValue?: number;
  maxValue?: number;
  q?: string;
  includeArchived?: boolean;
}
