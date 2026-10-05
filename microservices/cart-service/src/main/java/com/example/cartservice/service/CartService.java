package com.example.cartservice.service;

import com.example.cartservice.dto.CartItemResponse;
import com.example.cartservice.dto.ProductDTO;
import com.example.cartservice.model.CartItem;
import com.example.cartservice.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository repository;
    private final RestClient restClient;

    public CartService(CartItemRepository repository, RestClient restClient) {
        this.repository = repository;
        this.restClient = restClient;
    }

    public List<CartItemResponse> getCartByUserId(String userId) {
        List<CartItem> cartItems = repository.findByUserId(userId);

        return cartItems.stream().map(item -> {
            ProductDTO product = restClient.get()
                    .uri("/api/products/{id}", item.getProductId())
                    .retrieve()
                    .body(ProductDTO.class);

            CartItemResponse response = new CartItemResponse();
            response.setId(item.getId());
            response.setUserId(item.getUserId());
            response.setProductId(item.getProductId());
            response.setProductName(product != null ? product.getName() : "Unknown");
            response.setProductPrice(product != null ? product.getPrice() : 0);
            response.setQuantity(item.getQuantity());

            return response;
        }).toList();
    }

    @Transactional
    public CartItem addItem(CartItem item) {
        int quantityToAdd = Math.max(item.getQuantity(), 1);
        List<CartItem> existingItems = repository.findByUserIdAndProductId(item.getUserId(), item.getProductId());

        if (!existingItems.isEmpty()) {
            CartItem existingItem = existingItems.get(0);
            int existingQuantity = existingItems.stream()
                    .mapToInt(cartItem -> Math.max(cartItem.getQuantity(), 0))
                    .sum();
            existingItem.setQuantity(existingQuantity + quantityToAdd);

            if (existingItems.size() > 1) {
                repository.deleteAll(existingItems.subList(1, existingItems.size()));
            }

            return repository.save(existingItem);
        }

        item.setId(null);
        item.setQuantity(quantityToAdd);
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
