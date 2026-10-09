package com.udea.bancoudea.dto;

public class TransferRequestDTO {

    private String senderAccountNumber;
    private String receiverAccountNumber;
    private Double amount;

    // Constructor vacío
    public TransferRequestDTO() {
    }

    // Getters y Setters

    public String getSenderAccountNumber() {
        return senderAccountNumber;
    }

    public void setSenderAccountNumber(String senderAccountNumber) {
        this.senderAccountNumber = senderAccountNumber;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(String receiverAccountNumber) {
        this.receiverAccountNumber = receiverAccountNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}