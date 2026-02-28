package com.example.ubp.orders.service;

import com.example.ubp.orders.model.Product;
import com.example.ubp.orders.repo.ProductRepository;
import java.math.BigDecimal;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductDataInitializer implements ApplicationRunner {
    private final ProductRepository productRepository;

    public ProductDataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (productRepository.count() > 0) {
            return;
        }
        productRepository.save(build("Starter Laptop", new BigDecimal("599.99"), 10));
        productRepository.save(build("Business Mouse", new BigDecimal("19.99"), 100));
        productRepository.save(build("Office Keyboard", new BigDecimal("39.99"), 60));
    }

    private Product build(String name, BigDecimal price, int stock) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setStock(stock);
        return product;
    }
}
