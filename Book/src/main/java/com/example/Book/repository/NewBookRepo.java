package com.example.Book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Book.entities.Book;
import com.example.Book.entities.NewBook;

public interface NewBookRepo extends JpaRepository<NewBook, Integer> {}
