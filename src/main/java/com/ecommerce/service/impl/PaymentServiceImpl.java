package com.ecommerce.service.impl;

import com.ecommerce.dto.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public PaymentResponse processPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BadRequestException("Only newly created orders can be paid");
        }

        Payment payment = paymentRepository.findByOrder(order).orElseGet(() -> {
            Payment created = new Payment();
            created.setOrder(order);
            created.setTransactionRef("TXN-" + UUID.randomUUID());
            return created;
        });

        payment.setStatus(PaymentStatus.SUCCESS);
        order.setStatus(OrderStatus.PAID);

        Payment savedPayment = paymentRepository.save(payment);
        orderRepository.save(order);

        return PaymentResponse.builder()
                .paymentId(savedPayment.getId())
                .orderId(order.getId())
                .transactionRef(savedPayment.getTransactionRef())
                .status(savedPayment.getStatus())
                .build();
    }

    @Override
    public PaymentResponse getPaymentByOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .transactionRef(payment.getTransactionRef())
                .status(payment.getStatus())
                .build();
    }
}
