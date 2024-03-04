package com.example.Book.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "AddBook")
public class NewBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String author;
    private int price;
    
    // Default constructor required by Hibernate
    public NewBook() {
    }

    // Constructor with fields
    public NewBook(String title, String author, boolean status, int price) {
        this.title = title;
        this.author = author;
        this.price = price;
    }

    // Getters and setters (omitted for brevity)

    @Override
    public String toString() {
        return "NewBook [id=" + id + ", title=" + title + ", author=" + author +  ", price="
                + price + "]";
    }

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	

	public int getPrice() {
		return price;
	}

	public void setPrice(int price) {
		this.price = price;
	}
}
