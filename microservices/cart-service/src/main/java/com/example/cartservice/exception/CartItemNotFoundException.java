package com.example.cartservice.exception;

public class CartItemNotFoundException extends RuntimeException {
    public CartItemNotFoundException(Long id) {
        super("Cart item not found with id: " + id);
    }
}