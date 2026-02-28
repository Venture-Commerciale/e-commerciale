package com.example.ubp.billing.repo;

import com.example.ubp.billing.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
