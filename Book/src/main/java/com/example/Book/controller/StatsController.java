package com.example.Book.controller;

import com.example.Book.repository.BookRepository;
import com.example.Book.repository.TransactionRepository;
import com.example.Book.repository.UserRepository;
import com.example.Book.repository.CategoryRepository;
import com.example.Book.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private AuthorRepository authorRepository;

    @GetMapping
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("totalMembers", userRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalAuthors", authorRepository.count());
        return stats;
    }
}
