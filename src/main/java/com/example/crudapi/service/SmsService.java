package com.example.crudapi.service;

public interface SmsService {

    void sendOtp(String phone, String otp);
}
