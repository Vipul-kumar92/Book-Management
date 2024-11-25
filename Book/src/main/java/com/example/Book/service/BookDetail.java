package com.example.Book.service;

import java.util.List;

import com.example.Book.entities.Book;
import com.example.Book.entities.NewBook;

public interface BookDetail {

	List<Book> getdetail();
	Book adddetail(Book book);
	NewBook addBook(NewBook newbook);
	List<NewBook> getBook();
	void delete(Integer id);
	
	
	
}
