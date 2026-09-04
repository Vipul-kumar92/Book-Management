package com.example.Book.dto;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long memberId;
    private Long bookId;
    private int daysToIssue = 14; // default to 14 days
}
