package com.example.ubp.orders.repo;

import com.example.ubp.orders.model.OrderItem;
import com.example.ubp.orders.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
}
