package com.example.crudapi.dto;

public class VerifyOtpResponse {

    private String phone;
    private String role;
    private String token;
    private String message;

    public VerifyOtpResponse() {
    }

    public VerifyOtpResponse(String phone, String role, String token, String message) {
        this.phone = phone;
        this.role = role;
        this.token = token;
        this.message = message;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
