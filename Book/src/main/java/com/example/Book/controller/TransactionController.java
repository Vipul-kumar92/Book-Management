package com.example.Book.controller;

import com.example.Book.dto.TransactionRequest;
import com.example.Book.entities.Book;
import com.example.Book.entities.Transaction;
import com.example.Book.entities.TransactionStatus;
import com.example.Book.entities.User;
import com.example.Book.repository.BookRepository;
import com.example.Book.repository.TransactionRepository;
import com.example.Book.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<Transaction> getMemberTransactions(@PathVariable Long memberId) {
        return transactionRepository.findByMemberId(memberId);
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueBook(@RequestBody TransactionRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Book is currently out of stock");
        }

        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Get currently authenticated user (librarian/admin)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User issuedBy = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Librarian not found"));

        Transaction transaction = Transaction.builder()
                .member(member)
                .book(book)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(request.getDaysToIssue()))
                .status(TransactionStatus.ISSUED)
                .issuedBy(issuedBy)
                .fineAmount(BigDecimal.ZERO)
                .build();

        // Update book quantity
        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    @PutMapping("/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() == TransactionStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Book already returned");
        }

        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus(TransactionStatus.RETURNED);

        // Calculate fine if overdue (e.g., $1 per day)
        if (transaction.getReturnDate().isAfter(transaction.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(transaction.getDueDate(), transaction.getReturnDate());
            BigDecimal fine = BigDecimal.valueOf(daysOverdue * 1.0); // $1 per day fine
            transaction.setFineAmount(fine);
        }

        // Update book quantity
        Book book = transaction.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        return ResponseEntity.ok(transactionRepository.save(transaction));
    }
}
