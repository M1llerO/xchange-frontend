import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemService } from '../../../services/item';
import { ItemImageService } from '../../../services/item-image';
import { ItemImageDto } from '../../../models/item.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { resolveAssetUrl } from '../../../core/asset-url.util';

const MAX_IMAGES = 10;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-item-images',
  imports: [CommonModule, RouterLink],
  templateUrl: './item-images.html',
  styleUrl: './item-images.css'
})
export class ItemImages implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private imageService = inject(ItemImageService);

  readonly maxImages = MAX_IMAGES;
  readonly acceptAttr = ACCEPTED_TYPES.join(',');
  readonly resolveAssetUrl = resolveAssetUrl;
  itemId = signal(0);
  readonly justCreated = this.route.snapshot.queryParamMap.get('created') === '1';

  itemTitle = signal('');
  images = signal<ItemImageDto[]>([]);
  loading = signal(true);
  uploading = signal(false);
  savingOrder = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  dragIndex = signal<number | null>(null);
  private successTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const itemId = Number(params.get('id'));
      this.itemId.set(itemId);
      this.itemTitle.set('');
      this.images.set([]);
      this.errorMessage.set(null);
      this.loading.set(true);

      this.itemService.getById(itemId).subscribe({
        next: (item) => {
          this.itemTitle.set(item.title);
          this.images.set(this.sortByOrder(item.images));
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, "Impossibile caricare l'oggetto."));
          this.loading.set(false);
        }
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permette di ricaricare lo stesso file dopo un errore
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.errorMessage.set('Formato non supportato: usa JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.errorMessage.set('Il file supera il limite di 5 MB.');
      return;
    }
    if (this.images().length >= MAX_IMAGES) {
      this.errorMessage.set(`Puoi caricare al massimo ${MAX_IMAGES} immagini.`);
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set(null);
    this.imageService.upload(this.itemId(), file).subscribe({
      next: (image) => {
        this.images.update((list) => [...list, image]);
        this.uploading.set(false);
        this.showSuccess('Immagine caricata con successo.');
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Caricamento non riuscito.'));
        this.uploading.set(false);
      }
    });
  }

  confirmDone(): void {
    this.router.navigate(['/items']);
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => this.successMessage.set(null), 3000);
  }

  remove(image: ItemImageDto): void {
    this.errorMessage.set(null);
    this.imageService.remove(this.itemId(), image.id).subscribe({
      next: () => this.reloadImages(),
      error: (err) =>
        this.errorMessage.set(extractErrorMessage(err, "Impossibile eliminare l'immagine."))
    });
  }

  moveUp(index: number): void {
    if (index <= 0) {
      return;
    }
    this.swap(index, index - 1);
    this.persistOrder();
  }

  moveDown(index: number): void {
    if (index >= this.images().length - 1) {
      return;
    }
    this.swap(index, index + 1);
    this.persistOrder();
  }

  onDragStart(index: number): void {
    this.dragIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // necessario perche' il "drop" sia consentito
  }

  onDrop(targetIndex: number): void {
    const from = this.dragIndex();
    this.dragIndex.set(null);
    if (from === null || from === targetIndex) {
      return;
    }
    this.images.update((list) => {
      const next = [...list];
      const moved = next.splice(from, 1)[0];
      if (!moved) {
        return list;
      }
      next.splice(targetIndex, 0, moved);
      return next;
    });
    this.persistOrder();
  }

  onDragEnd(): void {
    this.dragIndex.set(null);
  }

  private swap(a: number, b: number): void {
    this.images.update((list) => {
      const next = [...list];
      const tmp = next[a];
      next[a] = next[b];
      next[b] = tmp;
      return next;
    });
  }

  private persistOrder(): void {
    this.savingOrder.set(true);
    this.errorMessage.set(null);
    const ids = this.images().map((image) => image.id);
    this.imageService.reorder(this.itemId(), ids).subscribe({
      next: (updated) => {
        this.images.set(this.sortByOrder(updated));
        this.savingOrder.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile salvare il nuovo ordine.'));
        this.savingOrder.set(false);
        this.reloadImages(); // ripristina l'ordine reale dal server
      }
    });
  }

  private reloadImages(): void {
    this.imageService.list(this.itemId()).subscribe({
      next: (images) => this.images.set(this.sortByOrder(images)),
      error: () => {
        /* la lista a schermo resta quella corrente */
      }
    });
  }

  private sortByOrder(images: ItemImageDto[]): ItemImageDto[] {
    return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  }
}
