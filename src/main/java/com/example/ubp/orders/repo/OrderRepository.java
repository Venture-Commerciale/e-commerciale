package com.example.ubp.orders.repo;

import com.example.ubp.auth.model.User;
import com.example.ubp.orders.model.Order;
import com.example.ubp.orders.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomer(User customer, Pageable pageable);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}
