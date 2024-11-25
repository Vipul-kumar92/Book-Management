package com.example.Book.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.Book.entities.Book;
import com.example.Book.entities.NewBook;
import com.example.Book.repository.NewBookRepo;
import com.example.Book.service.BookDetail;

@CrossOrigin("http://localhost:3000")
@RestController
public class MyController {
	
	@Autowired
	public BookDetail bookDetail;
	
	@GetMapping("/home")
	public String home() {
		return "welcome";
	}
	
	@GetMapping("/book")
	public List<Book> getdetail(){
		return bookDetail.getdetail();
	}

	@PostMapping("/books/{id}")
	public Book adddetail(@RequestBody Book book, @PathVariable("id")Integer id) {
		
		Book a= bookDetail.adddetail(book);
		 bookDetail.delete(id);
		return a;
	}
	@GetMapping("/addbooks")
	public List<NewBook> getBookl(){
		return bookDetail.getBook();
	}
	@PostMapping("addbook")
	public NewBook addBook(@RequestBody NewBook newbook ) {
		 return bookDetail.addBook(newbook);
		
	}
//	@GetMapping("/addbooks/{id}")
//	public NewBook getbook(@PathVariable("id") Integer id) {
//	    // Return the found book
//	    return bookDetail.getbook(id);
//	}
	@GetMapping("/addbooks/{id}")
	public void deletenewbook(@PathVariable("id")Integer id) {
	        bookDetail.delete(id);
	}
	
}
