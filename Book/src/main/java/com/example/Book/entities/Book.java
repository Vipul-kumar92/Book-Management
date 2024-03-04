package com.example.Book.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name="Book")
public class Book {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;
    public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	private int rollno;
    private String name;
    private String Bookname;
    private String date;
    private String payment;
    
    // Default constructor
    public Book() {
    }

    
  

    @Override
	public String toString() {
		return "Book [id=" + id + ", rollno=" + rollno + ", name=" + name + ", Bookname=" + Bookname + ", date=" + date
				+ ", payment=" + payment + "]";
	}

	public int getRollno() {
        return rollno;
    }

    public void setRollno(int rollno) {
        this.rollno = rollno;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBookname() {
        return Bookname;
    }

    public void setBookname(String bookname) {
        Bookname = bookname;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getPayment() {
        return payment;
    }

    public void setPayment(String payment) {
        this.payment = payment;
    }

    // Constructor with fields
    public Book(int rollno, String name, String Bookname, String date, String payment) {
        this.rollno = rollno;
        this.name = name;
        this.Bookname = Bookname;
        this.date = date;
        this.payment = payment;
    }
}
