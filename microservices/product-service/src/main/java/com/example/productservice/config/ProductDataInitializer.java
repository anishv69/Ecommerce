package com.example.productservice.config;

import com.example.productservice.model.Product;
import com.example.productservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true", matchIfMissing = true)
public class ProductDataInitializer implements CommandLineRunner {

    private static final List<CatalogProduct> CATALOG = List.of(
            new CatalogProduct("Headphones", "Noise-cancelling headphones for work and travel.", "89.99", 8),
            new CatalogProduct("Smart Fitness Watch", "Track workouts, sleep, and daily activity.", "129.99", 18),
            new CatalogProduct("Portable Bluetooth Speaker", "Compact speaker with rich sound and all-day battery life.", "49.99", 30),
            new CatalogProduct("USB-C Charging Hub", "Six-port charging hub for laptops, tablets, and phones.", "34.99", 40),
            new CatalogProduct("Ergonomic Office Chair", "Adjustable support for comfortable work sessions.", "189.99", 12),
            new CatalogProduct("Everyday Backpack", "Water-resistant backpack with padded laptop storage.", "59.99", 22),
            new CatalogProduct("Mechanical Keyboard", "Tactile mechanical keyboard with customizable backlighting.", "74.99", 20),
            new CatalogProduct("Wireless Mouse", "Comfortable precision mouse for work and everyday browsing.", "29.99", 35),
            new CatalogProduct("4K Webcam", "Sharp 4K webcam for meetings, streaming, and calls.", "99.99", 14),
            new CatalogProduct("Adjustable Laptop Stand", "Aluminum stand that raises your laptop to a comfortable height.", "44.99", 24),
            new CatalogProduct("Smart LED Desk Lamp", "Dimmable desk lamp with adjustable color temperature.", "39.99", 28)
    );

    private final ProductRepository repository;

    public ProductDataInitializer(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        List<Product> existingProducts = repository.findAll();

        for (CatalogProduct catalogProduct : CATALOG) {
            List<Product> matches = existingProducts.stream()
                    .filter(product -> sameCatalogProduct(product.getName(), catalogProduct.name()))
                    .toList();

            if (matches.isEmpty()) {
                Product saved = repository.save(catalogProduct.toProduct());
                existingProducts.add(saved);
                continue;
            }

            Product retainedProduct = matches.get(0);
            if (isHeadphone(retainedProduct.getName()) && !catalogProduct.name().equals(retainedProduct.getName())) {
                retainedProduct.setName(catalogProduct.name());
                repository.save(retainedProduct);
            }

            if (matches.size() > 1) {
                repository.deleteAll(matches.subList(1, matches.size()));
            }
        }
    }

    private boolean sameCatalogProduct(String existingName, String catalogName) {
        if (isHeadphone(existingName) && isHeadphone(catalogName)) {
            return true;
        }
        return normalize(existingName).equals(normalize(catalogName));
    }

    private boolean isHeadphone(String name) {
        return name != null && name.toLowerCase().contains("headphone");
    }

    private String normalize(String name) {
        return name == null ? "" : name.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private record CatalogProduct(String name, String description, String price, int stockQuantity) {
        Product toProduct() {
            return new Product(null, name, description, new BigDecimal(price), stockQuantity);
        }
    }
}
