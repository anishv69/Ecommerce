package com.example.cartservice.service;

import com.example.cartservice.model.CartItem;
import com.example.cartservice.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository repository;

    public CartService(CartItemRepository repository) {
        this.repository = repository;
    }

    public List<CartItem> getCartByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    public CartItem addItem(CartItem item) {
        return repository.save(item);
    }

    public boolean removeItem(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }

    @Transactional
    public void clearCart(String userId) {
        repository.deleteByUserId(userId);
    }
}