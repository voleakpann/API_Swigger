package com.example.crudapi.dto;

import java.time.LocalDateTime;

public class SendOtpResponse {

    private String phone;
    private String otp;
    private LocalDateTime expiresAt;
    private String message;

    public SendOtpResponse() {
    }

    public SendOtpResponse(String phone, String otp, LocalDateTime expiresAt, String message) {
        this.phone = phone;
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.message = message;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
