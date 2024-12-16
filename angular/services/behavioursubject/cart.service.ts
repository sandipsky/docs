import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]); // BehaviorSubject holding the cart state

  // Observable that represents the current cart items
  cartItems$ = this.cartItemsSubject.asObservable();

  // Observable for the total price of the cart
  cartTotal$: Observable<number> = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.price * item.quantity, 0))
  );

  // Observable for the total number of items (count) in the cart
  cartCount$: Observable<number> = this.cartItems$.pipe(
    map((items) => items.reduce((count, item) => count + item.quantity, 0))
  );

  // Add item to the cart
  addToCart(item: CartItem): void {
    const currentItems = this.cartItemsSubject.value; // Current cart items
    const existingItemIndex = currentItems.findIndex((i) => i.id === item.id);

    if (existingItemIndex >= 0) {
      currentItems[existingItemIndex].quantity += item.quantity; // Increment quantity
    } else {
      currentItems.push(item); // Add new item
    }

    this.cartItemsSubject.next([...currentItems]); // Emit the updated cart state
  }

  // Remove item from the cart
  removeFromCart(itemId: number): void {
    const updatedItems = this.cartItemsSubject.value.filter((item) => item.id !== itemId);
    this.cartItemsSubject.next(updatedItems); // Emit the updated cart state
  }

  // Clear the cart
  clearCart(): void {
    this.cartItemsSubject.next([]); // Emit an empty array to clear the cart
  }
}
