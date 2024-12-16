import { Injectable, signal, computed } from '@angular/core';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Signal to hold the cart state
  private cartItems = signal<CartItem[]>([]);

  // Computed signal for cart total
  cartTotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0)
  );

  // Computed signal for the cart count
  cartCount = computed(() =>
    this.cartItems().reduce((count, item) => count + item.quantity, 0)
  );

  // Add an item to the cart
  addToCart(item: CartItem): void {
    const existingItems = [...this.cartItems()];
    const index = existingItems.findIndex((i) => i.id === item.id);

    if (index >= 0) {
      existingItems[index].quantity += item.quantity;
    } else {
      existingItems.push(item);
    }

    this.cartItems.set(existingItems); // Update signal
  }

  // Remove an item from the cart
  removeFromCart(itemId: number): void {
    const updatedItems = this.cartItems().filter((item) => item.id !== itemId);
    this.cartItems.set(updatedItems); // Update signal
  }

  // Clear the cart
  clearCart(): void {
    this.cartItems.set([]); // Clear signal
  }

  // Get the current cart items as a signal
  getCartItems() {
    return this.cartItems;
  }
}
