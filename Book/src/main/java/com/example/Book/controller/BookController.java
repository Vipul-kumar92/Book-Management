package com.example.Book.controller;

import com.example.Book.entities.Book;
import com.example.Book.entities.Author;
import com.example.Book.entities.Category;
import com.example.Book.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private com.example.Book.repository.CategoryRepository categoryRepository;

    @Autowired
    private com.example.Book.repository.AuthorRepository authorRepository;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private Category resolveCategory(Category category) {
        if (category == null) return null;
        if (category.getId() != null) {
            return categoryRepository.findById(category.getId()).orElse(null);
        }
        if (category.getName() != null && !category.getName().trim().isEmpty()) {
            String trimmedName = category.getName().trim();
            return categoryRepository.findByNameIgnoreCase(trimmedName)
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(trimmedName).build()));
        }
        return null;
    }

    private Author resolveAuthor(Author author) {
        if (author == null) return null;
        if (author.getId() != null) {
            return authorRepository.findById(author.getId()).orElse(null);
        }
        if (author.getName() != null && !author.getName().trim().isEmpty()) {
            String trimmedName = author.getName().trim();
            return authorRepository.findByNameIgnoreCase(trimmedName)
                    .orElseGet(() -> authorRepository.save(Author.builder().name(trimmedName).build()));
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        if (book.getIsbn() != null && !book.getIsbn().trim().isEmpty() && bookRepository.existsByIsbn(book.getIsbn().trim())) {
            return ResponseEntity.badRequest().body("Book with this ISBN already exists");
        }
        if (book.getAvailableQuantity() == null) {
            book.setAvailableQuantity(book.getQuantity());
        }
        book.setCategory(resolveCategory(book.getCategory()));
        book.setAuthor(resolveAuthor(book.getAuthor()));
        return ResponseEntity.ok(bookRepository.save(book));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        return bookRepository.findById(id).map(book -> {
            book.setIsbn(bookDetails.getIsbn());
            book.setTitle(bookDetails.getTitle());
            if (bookDetails.getCategory() != null) {
                book.setCategory(resolveCategory(bookDetails.getCategory()));
            }
            if (bookDetails.getAuthor() != null) {
                book.setAuthor(resolveAuthor(bookDetails.getAuthor()));
            }
            book.setPublisher(bookDetails.getPublisher());
            book.setPublicationYear(bookDetails.getPublicationYear());
            book.setLanguage(bookDetails.getLanguage());
            book.setEdition(bookDetails.getEdition());
            book.setPrice(bookDetails.getPrice());
            book.setQuantity(bookDetails.getQuantity());
            book.setAvailableQuantity(bookDetails.getAvailableQuantity());
            book.setDescription(bookDetails.getDescription());
            book.setCoverImage(bookDetails.getCoverImage());
            book.setShelfNumber(bookDetails.getShelfNumber());
            book.setStatus(bookDetails.getStatus());
            return ResponseEntity.ok(bookRepository.save(book));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookRepository.findById(id).map(book -> {
            bookRepository.delete(book);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
