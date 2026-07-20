
package com.example.cartservice.repository;

import com.example.cartservice.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(String userId);
    void deleteByUserId(String userId);
    void deleteByProductId(Long productId);
}