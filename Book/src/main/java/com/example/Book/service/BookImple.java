package com.example.Book.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.example.Book.entities.Book;
import com.example.Book.entities.NewBook;
import com.example.Book.repository.BookRepo;
import com.example.Book.repository.NewBookRepo;

@Service
public class BookImple implements BookDetail{

	@Autowired
	public BookRepo bookrepo;
	@Override
	public List<Book> getdetail() {
		// TODO Auto-generated method stub
		return bookrepo.findAll();
	}
	@Override
	public Book adddetail(Book book) {
		// TODO Auto-generated method stub
		bookrepo.save(book);
		return book;
	}
	
	@Autowired
	public NewBookRepo newbookRepo;
	@Override
	public NewBook addBook(NewBook newbook) {

		newbookRepo.save(newbook);
		return newbook;
		
	}
	
	@Override
	public List<NewBook> getBook() {
		// TODO Auto-generated method stub
		return newbookRepo.findAll();
	}
	@Override
	public void delete(Integer id) {
		newbookRepo.deleteById(id);
	}
	

}
