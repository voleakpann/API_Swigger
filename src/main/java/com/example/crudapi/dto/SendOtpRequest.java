package com.example.crudapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendOtpRequest {

    @NotBlank(message = "Phone is required")
    @Size(min = 6, max = 20, message = "Phone must be between 6 and 20 characters")
    private String phone;

    public SendOtpRequest() {
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
