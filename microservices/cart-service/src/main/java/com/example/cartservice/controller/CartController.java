package com.example.cartservice.controller;

import com.example.cartservice.dto.CartItemResponse;
import com.example.cartservice.model.CartItem;
import com.example.cartservice.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<CartItemResponse> getCart(@PathVariable String userId) {
        return service.getCartByUserId(userId);
    }

    @PostMapping
    public CartItem addItem(@RequestBody CartItem item) {
        return service.addItem(item);
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        if (service.removeItem(id)) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        service.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}