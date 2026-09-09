import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService } from '../../../services/item';
import { Category, CategoryService } from '../../../services/category';
import { CreateItemRequest, ItemCondition, UpdateItemRequest } from '../../../models/item.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { CONDITION_OPTIONS } from '../item.constants';

@Component({
  selector: 'app-item-form',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css'
})
export class ItemForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);

  readonly conditionOptions = CONDITION_OPTIONS;

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.idParam !== null;
  itemId = signal<number | null>(this.idParam ? Number(this.idParam) : null);

  categories = signal<Category[]>([]);
  loading = signal(this.isEdit);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    categoryId: this.fb.control<number | null>(null, { validators: Validators.required }),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(2000)]),
    estimatedValue: this.fb.control<number | null>(null, [Validators.min(0)]),
    itemCondition: this.fb.nonNullable.control<ItemCondition | ''>('', Validators.required),
    archived: this.fb.nonNullable.control(false)
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories.filter((c) => c.active)),
      error: () => {
        /* senza categorie il campo resta vuoto: l'errore viene mostrato al salvataggio */
      }
    });

    if (this.isEdit) {
      this.route.paramMap.subscribe((params) => {
        const itemId = Number(params.get('id'));
        this.itemId.set(itemId);
        this.errorMessage.set(null);
        this.loading.set(true);

        this.itemService.getById(itemId).subscribe({
          next: (item) => {
            this.form.patchValue({
              categoryId: item.categoryId,
              title: item.title,
              description: item.description,
              estimatedValue: item.estimatedValue,
              itemCondition: item.itemCondition,
              archived: item.archived
            });
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMessage.set(extractErrorMessage(err, "Impossibile caricare l'oggetto."));
            this.loading.set(false);
          }
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload: CreateItemRequest = {
      categoryId: raw.categoryId!,
      title: raw.title.trim(),
      description: raw.description.trim(),
      itemCondition: raw.itemCondition as ItemCondition
    };
    if (raw.estimatedValue !== null) {
      payload.estimatedValue = raw.estimatedValue;
    }

    const request$ = this.isEdit
      ? this.itemService.update(this.itemId()!, {
          ...payload,
          archived: raw.archived
        } as UpdateItemRequest)
      : this.itemService.create(payload);

    request$.subscribe({
      next: (item) => {
        this.submitting.set(false);
        if (this.isEdit) {
          this.router.navigate(['/items']);
        } else {
          // appena creato: si prosegue naturalmente con l'aggiunta delle foto
          this.router.navigate(['/items', item.id, 'images'], { queryParams: { created: 1 } });
        }
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, "Impossibile salvare l'oggetto."));
        this.submitting.set(false);
      }
    });
  }
}
