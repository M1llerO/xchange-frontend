import { Component, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { form, FormField, submit } from '@angular/forms/signals';
import { ListingsService } from '../../../services/listing.services';
import { CategoryService, Category } from '../../../services/category';
import { ItemService } from '../../../services/item';
import { ItemDto } from '../../../models/item.model';
import { CreateListingRequest } from '../../../models/listing.model';

@Component({
  imports: [FormField],
  selector: 'app-create-listing',
  styleUrl: './create-listing.css',
  templateUrl: './create-listing.html',
})
export class CreateListing implements OnInit {

  constructor(
    private listingsService: ListingsService,
    private categoryService: CategoryService,
    private itemService: ItemService
  ) {}

  model = signal({ city: '', acceptedCategoryIds: [] as number[], itemId: 0 });
  myForm = form(this.model);

  categories: Category[] = [];
  items: ItemDto[] = [];

  ngOnInit() {
    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;
    });

    this.itemService.getAll().subscribe((items) => {
      this.items = items;
    });
  }

  toggleCategory(id: number) {
    this.model.update((currentModel) => {
      const alreadySelected = currentModel.acceptedCategoryIds.includes(id);

      const updatedIds = alreadySelected
        ? currentModel.acceptedCategoryIds.filter((catId) => catId !== id)
        : [...currentModel.acceptedCategoryIds, id];

      return {
        ...currentModel,
        acceptedCategoryIds: updatedIds
      };
    });
  }

  selectItem(id: number) {
    this.model.update((currentModel) => ({
      ...currentModel,
      itemId: id
    }));
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.myForm, async (field) => {
      const request: CreateListingRequest = field().value();
      this.listingsService.create(request).subscribe();
    });
  }
}