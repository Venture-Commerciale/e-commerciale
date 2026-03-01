package com.example.ubp.orders.service;

import com.example.ubp.auth.model.User;
import com.example.ubp.auth.repo.UserRepository;
import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.billing.service.BillingService;
import com.example.ubp.common.audit.AuditService;
import com.example.ubp.common.exception.ResourceNotFoundException;
import com.example.ubp.orders.dto.OrderItemRequest;
import com.example.ubp.orders.dto.OrderItemResponse;
import com.example.ubp.orders.dto.OrderRequest;
import com.example.ubp.orders.dto.OrderResponse;
import com.example.ubp.orders.dto.ProductResponse;
import com.example.ubp.orders.dto.UpdateOrderStatusRequest;
import com.example.ubp.orders.model.Order;
import com.example.ubp.orders.model.OrderItem;
import com.example.ubp.orders.model.OrderStatus;
import com.example.ubp.orders.model.Product;
import com.example.ubp.orders.repo.OrderItemRepository;
import com.example.ubp.orders.repo.OrderRepository;
import com.example.ubp.orders.repo.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final BillingService billingService;
    private final AuditService auditService;

    public OrderService(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        BillingService billingService,
        AuditService auditService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.billingService = billingService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> listProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
            .map(product -> ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .build());
    }

    @Transactional
    public OrderResponse createOrder(UserPrincipal principal, OrderRequest request) {
        Order order = new Order();
        order.setCustomer(principal.getUser());
        order.setStatus(OrderStatus.NEW);
        order.setTotal(BigDecimal.ZERO);
        orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Not enough stock for " + product.getName());
            }
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(product.getPrice());
            orderItemRepository.save(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        order.setTotal(total);
        orderRepository.save(order);
        billingService.createInvoiceForOrder(order);
        auditService.log(principal.getUser(), "CREATE_ORDER", "Order", order.getId());

        return buildOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listOrders(UserPrincipal principal, OrderStatus status, Long customerId, Pageable pageable) {
        if (com.example.ubp.auth.util.SecurityUtils.isStaff(principal)) {
            if (customerId != null) {
                User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                return orderRepository.findByCustomer(customer, pageable).map(this::buildOrderResponse);
            }
            if (status != null) {
                return orderRepository.findByStatus(status, pageable).map(this::buildOrderResponse);
            }
            return orderRepository.findAll(pageable).map(this::buildOrderResponse);
        }
        return orderRepository.findByCustomer(principal.getUser(), pageable).map(this::buildOrderResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UserPrincipal principal, Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!com.example.ubp.auth.util.SecurityUtils.isStaff(principal)
            && !order.getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to view this order");
        }
        return buildOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(UserPrincipal principal, Long id, UpdateOrderStatusRequest request) {
        if (!com.example.ubp.auth.util.SecurityUtils.isStaff(principal)) {
            throw new IllegalArgumentException("Not allowed to update order status");
        }
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(request.getStatus());
        orderRepository.save(order);
        auditService.log(principal.getUser(), "UPDATE_ORDER_STATUS", "Order", order.getId());
        return buildOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public User getCustomer(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    // role utility removed, SecurityUtils should be used instead


    private OrderResponse buildOrderResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrder(order).stream()
            .map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build())
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .customerId(order.getCustomer().getId())
            .status(order.getStatus())
            .total(order.getTotal())
            .createdAt(order.getCreatedAt())
            .items(items)
            .build();
    }
}
