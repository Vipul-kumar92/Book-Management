package com.example.Book;

import com.example.Book.entities.*;
import com.example.Book.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class BookApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            AuthorRepository authorRepository,
            BookRepository bookRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin if not present
            if (userRepository.findByEmail("admin@library.com").isEmpty()) {
                User admin = User.builder()
                        .name("System Administrator")
                        .email("admin@library.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .phone("+1 555-0100")
                        .address("Library HQ, Suite 101")
                        .registrationDate(LocalDateTime.now())
                        .status("ACTIVE")
                        .build();
                userRepository.save(admin);
            }

            // Seed Member if not present
            if (userRepository.findByEmail("member@library.com").isEmpty()) {
                User member = User.builder()
                        .name("Alex Johnson")
                        .email("member@library.com")
                        .password(passwordEncoder.encode("member123"))
                        .role(Role.MEMBER)
                        .phone("+1 555-0199")
                        .address("42 Maple Street, Cityville")
                        .registrationDate(LocalDateTime.now())
                        .status("ACTIVE")
                        .build();
                userRepository.save(member);
            }

            // Seed Categories if empty
            if (categoryRepository.count() == 0) {
                Category cs = categoryRepository.save(Category.builder().name("Computer Science").description("Software engineering, algorithms, architectures").build());
                Category tech = categoryRepository.save(Category.builder().name("Technology").description("Emerging technology, AI, hardware").build());
                Category fiction = categoryRepository.save(Category.builder().name("Fiction & Literature").description("Classic and modern narrative fiction").build());
                Category science = categoryRepository.save(Category.builder().name("Science").description("Physics, biology, and scientific studies").build());

                // Seed Authors
                Author author1 = authorRepository.save(Author.builder().name("Robert C. Martin").bio("Author of Clean Code and agile software advocate.").build());
                Author author2 = authorRepository.save(Author.builder().name("Joshua Bloch").bio("Former Chief Java Architect at Google and author of Effective Java.").build());
                Author author3 = authorRepository.save(Author.builder().name("George Orwell").bio("English novelist and critic famous for 1984 and Animal Farm.").build());

                // Seed Books
                if (bookRepository.count() == 0) {
                    bookRepository.save(Book.builder()
                            .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                            .isbn("978-0132350884")
                            .price(new BigDecimal("42.99"))
                            .quantity(10)
                            .availableQuantity(10)
                            .edition("1st Edition")
                            .publisher("Prentice Hall")
                            .publicationYear(2008)
                            .language("English")
                            .shelfNumber("CS-A101")
                            .description("Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.")
                            .status("AVAILABLE")
                            .category(cs)
                            .author(author1)
                            .build());

                    bookRepository.save(Book.builder()
                            .title("Effective Java")
                            .isbn("978-0134685991")
                            .price(new BigDecimal("49.99"))
                            .quantity(8)
                            .availableQuantity(8)
                            .edition("3rd Edition")
                            .publisher("Addison-Wesley")
                            .publicationYear(2017)
                            .language("English")
                            .shelfNumber("CS-B202")
                            .description("The definitive guide to best practices in the Java programming language.")
                            .status("AVAILABLE")
                            .category(cs)
                            .author(author2)
                            .build());

                    bookRepository.save(Book.builder()
                            .title("1984")
                            .isbn("978-0451524935")
                            .price(new BigDecimal("14.99"))
                            .quantity(15)
                            .availableQuantity(15)
                            .edition("Centennial Edition")
                            .publisher("Signet Classic")
                            .publicationYear(1949)
                            .language("English")
                            .shelfNumber("FIC-O99")
                            .description("A dystopian social science fiction novel and cautionary tale about totalitarianism.")
                            .status("AVAILABLE")
                            .category(fiction)
                            .author(author3)
                            .build());
                }
            }
        };
    }
}
