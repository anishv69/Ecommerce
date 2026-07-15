package com.example.cartservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CartItemResponse {

    private Long id;
    private String userId;
    private Long productId;
    private String productName;
    private double productPrice;
    private int quantity;
}